import pytest_asyncio
from app.utils.seed_data import seed_initial_data_if_empty


@pytest_asyncio.fixture(autouse=True)
async def seed_data_for_tests():
    await seed_initial_data_if_empty()
