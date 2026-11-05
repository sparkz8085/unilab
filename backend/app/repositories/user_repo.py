from typing import List, Optional
from bson import ObjectId
from app.models.user import UserModel, UserRole
from app.repositories.base import BaseRepository, format_doc


class UserRepository(BaseRepository[UserModel]):
    def __init__(self):
        super().__init__("users", UserModel)

    async def get_by_email(self, email: str) -> Optional[dict]:
        col = self.collection
        if col is not None:
            doc = await col.find_one({"email": email.lower()})
            return format_doc(doc)
        for doc in self._mock_data.values():
            if doc.get("email", "").lower() == email.lower():
                return dict(doc)
        return None

    async def get_by_role(self, role: UserRole) -> List[dict]:
        return await self.list(query={"role": role})

    async def add_enrolled_course(self, user_id: str, course_id: str):
        col = self.collection
        if col is not None:
            oid = ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id
            await col.update_one({"_id": oid}, {"$addToSet": {"enrolled_course_ids": course_id}})
            return
        if user_id in self._mock_data:
            courses = self._mock_data[user_id].setdefault("enrolled_course_ids", [])
            if course_id not in courses:
                courses.append(course_id)


user_repo = UserRepository()
