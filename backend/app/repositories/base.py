from typing import Any, Dict, Generic, List, Optional, Type, TypeVar
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection
from pydantic import BaseModel

from app.core.database import db_manager

T = TypeVar("T", bound=BaseModel)


def format_doc(doc: Optional[dict]) -> Optional[dict]:
    """Helper to convert MongoDB _id to str id and sanitize nested fields."""
    if not doc:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc


def matches_query(doc: dict, query: Dict[str, Any]) -> bool:
    """Evaluates whether a dictionary document matches a MongoDB-like query in memory."""
    for key, expected in query.items():
        val = doc.get(key)
        if isinstance(expected, dict):
            # Check operators
            if "$in" in expected:
                if val not in expected["$in"] and not (isinstance(val, list) and any(x in expected["$in"] for x in val)):
                    return False
            if "$ne" in expected:
                if val == expected["$ne"]:
                    return False
            if "$addToSet" in expected:
                pass
        elif isinstance(val, list):
            if expected not in val:
                return False
        else:
            if val != expected:
                return False
    return True


class BaseRepository(Generic[T]):
    def __init__(self, collection_name: str, model_cls: Type[T]):
        self.collection_name = collection_name
        self.model_cls = model_cls
        self._mock_data: Dict[str, dict] = {}

    @property
    def collection(self) -> Optional[AsyncIOMotorCollection]:
        if db_manager.is_connected and db_manager.db is not None:
            return db_manager.db[self.collection_name]
        return None

    async def get_by_id(self, id_str: str) -> Optional[dict]:
        col = self.collection
        if col is not None:
            try:
                oid = ObjectId(id_str) if ObjectId.is_valid(id_str) else id_str
                doc = await col.find_one({"_id": oid})
                return format_doc(doc)
            except Exception:
                return None
        doc = self._mock_data.get(id_str)
        return dict(doc) if doc else None

    async def find_one(self, query: Dict[str, Any]) -> Optional[dict]:
        col = self.collection
        if col is not None:
            doc = await col.find_one(query)
            return format_doc(doc)
        for doc in self._mock_data.values():
            if matches_query(doc, query):
                return dict(doc)
        return None

    async def list(
        self,
        query: Optional[Dict[str, Any]] = None,
        skip: int = 0,
        limit: int = 100,
        sort_by: str = "created_at",
        sort_order: int = -1
    ) -> List[dict]:
        col = self.collection
        q = query or {}
        if col is not None:
            cursor = col.find(q).sort(sort_by, sort_order).skip(skip).limit(limit)
            results = []
            async for doc in cursor:
                results.append(format_doc(doc))
            return results
        filtered = [
            dict(d) for d in self._mock_data.values()
            if matches_query(d, q)
        ]
        return filtered[skip : skip + limit]

    async def count(self, query: Optional[Dict[str, Any]] = None) -> int:
        col = self.collection
        q = query or {}
        if col is not None:
            return await col.count_documents(q)
        return len([
            d for d in self._mock_data.values()
            if matches_query(d, q)
        ])

    async def create(self, data: dict) -> dict:
        col = self.collection
        doc_data = data.copy()
        if "id" in doc_data and not doc_data.get("_id"):
            doc_data["_id"] = ObjectId(doc_data["id"]) if ObjectId.is_valid(doc_data["id"]) else doc_data["id"]
            del doc_data["id"]

        if col is not None:
            res = await col.insert_one(doc_data)
            doc_data["id"] = str(res.inserted_id)
            if "_id" in doc_data:
                del doc_data["_id"]
            return doc_data

        new_id = str(doc_data.get("_id", ObjectId()))
        doc_data["id"] = new_id
        if "_id" in doc_data:
            del doc_data["_id"]
        self._mock_data[new_id] = doc_data
        return doc_data

    async def update(self, id_str: str, update_data: dict) -> Optional[dict]:
        col = self.collection
        if col is not None:
            oid = ObjectId(id_str) if ObjectId.is_valid(id_str) else id_str
            await col.update_one({"_id": oid}, {"$set": update_data})
            return await self.get_by_id(id_str)
        if id_str in self._mock_data:
            self._mock_data[id_str].update(update_data)
            return dict(self._mock_data[id_str])
        return None

    async def delete(self, id_str: str) -> bool:
        col = self.collection
        if col is not None:
            oid = ObjectId(id_str) if ObjectId.is_valid(id_str) else id_str
            res = await col.delete_one({"_id": oid})
            return res.deleted_count > 0
        if id_str in self._mock_data:
            del self._mock_data[id_str]
            return True
        return False
