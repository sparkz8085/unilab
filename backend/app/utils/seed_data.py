from datetime import datetime, timedelta, timezone
from app.core.security import get_password_hash
from app.models.practical import Attachment, PracticalStatus, RubricCriterion
from app.models.submission import SubmissionFile, SubmissionStatus
from app.models.user import UserRole
from app.repositories.course_repo import course_repo
from app.repositories.feedback_repo import feedback_repo
from app.repositories.practical_repo import practical_repo
from app.repositories.session_repo import session_repo
from app.repositories.submission_repo import submission_repo
from app.repositories.user_repo import user_repo


async def seed_initial_data_if_empty():
    """Seeds initial demonstration data if the user database is empty."""
    user_count = await user_repo.count()
    if user_count > 0:
        return

    now = datetime.now(timezone.utc)
    hashed_pw = get_password_hash("password123")

    # 1. Create Academic Session
    session = await session_repo.create({
        "name": "Fall 2026 - Academic Year 2026-27",
        "start_date": now - timedelta(days=30),
        "end_date": now + timedelta(days=90),
        "is_current": True,
        "created_at": now
    })

    # 2. Create Users
    admin_user = await user_repo.create({
        "email": "arthur@admin.unilab.edu",
        "password_hash": hashed_pw,
        "full_name": "Prof. Arthur Vance (Dean/Admin)",
        "role": UserRole.ADMIN,
        "employee_id": "ADM-001",
        "department": "Department of Computer Science & Engineering",
        "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
        "is_active": True,
        "enrolled_course_ids": [],
        "created_at": now,
        "updated_at": now
    })

    teacher_user = await user_repo.create({
        "email": "eleanor@faculty.unilab.edu",
        "password_hash": hashed_pw,
        "full_name": "Dr. Eleanor Sterling",
        "role": UserRole.TEACHER,
        "employee_id": "FAC-204",
        "department": "Computer Science & Engineering",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "is_active": True,
        "enrolled_course_ids": [],
        "created_at": now,
        "updated_at": now
    })

    student_alex = await user_repo.create({
        "email": "alex.042@stud.unilab.edu",
        "password_hash": hashed_pw,
        "full_name": "Alex Chen",
        "role": UserRole.STUDENT,
        "student_id": "CS-2024-042",
        "department": "Computer Science & Engineering",
        "avatar_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        "is_active": True,
        "enrolled_course_ids": [],
        "created_at": now,
        "updated_at": now
    })

    student_maya = await user_repo.create({
        "email": "maya.089@stud.unilab.edu",
        "password_hash": hashed_pw,
        "full_name": "Maya Lin",
        "role": UserRole.STUDENT,
        "student_id": "CS-2024-089",
        "department": "Computer Science & Engineering",
        "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        "is_active": True,
        "enrolled_course_ids": [],
        "created_at": now,
        "updated_at": now
    })

    # 3. Create Courses
    course_dsa = await course_repo.create({
        "code": "CS301",
        "title": "Data Structures & Algorithms Laboratory",
        "description": "Hands-on implementation of balanced trees, graph traversal algorithms, dynamic programming, and asymptotic runtime analysis.",
        "department": "Computer Science & Engineering",
        "academic_session_id": session["id"],
        "teacher_ids": [teacher_user["id"]],
        "student_ids": [student_alex["id"], student_maya["id"]],
        "is_active": True,
        "created_at": now,
        "updated_at": now
    })

    course_os = await course_repo.create({
        "code": "CS302",
        "title": "Operating Systems & Concurrency Lab",
        "description": "POSIX thread synchronization, mutual exclusion primitives, memory paging simulations, and multi-threaded IPC pipelines.",
        "department": "Computer Science & Engineering",
        "academic_session_id": session["id"],
        "teacher_ids": [teacher_user["id"]],
        "student_ids": [student_alex["id"]],
        "is_active": True,
        "created_at": now,
        "updated_at": now
    })

    # Update enrolled courses on students
    await user_repo.add_enrolled_course(student_alex["id"], course_dsa["id"])
    await user_repo.add_enrolled_course(student_alex["id"], course_os["id"])
    await user_repo.add_enrolled_course(student_maya["id"], course_dsa["id"])

    # 4. Create Practicals
    prac_bst = await practical_repo.create({
        "course_id": course_dsa["id"],
        "lab_number": 1,
        "title": "AVL Tree Balancing & Rotations",
        "objective": "Implement an AVL self-balancing binary search tree with single (LL/RR) and double (LR/RL) rotational routines.",
        "instructions_md": """### Lab 1: AVL Tree Balancing & Rotations

#### Objectives
1. Understand the invariants of height-balanced binary search trees.
2. Implement insertion with balance factor updates: $BF(node) = height(left) - height(right)$.
3. Perform LL, RR, LR, and RL rotations when $|BF(node)| > 1$.

#### Input Format
A sequence of integers to insert into the tree.

#### Expected Output
In-order traversal with balance factors and root verification after all insertions.
""",
        "starter_code": {
            "python": """class Node:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None
        self.height = 1

class AVLTree:
    def insert(self, root, key):
        # Step 1: Standard BST insert
        if not root:
            return Node(key)
        elif key < root.key:
            root.left = self.insert(root.left, key)
        else:
            root.right = self.insert(root.right, key)

        # Step 2: Update height
        root.height = 1 + max(self.get_height(root.left), self.get_height(root.right))

        # Step 3: Get balance factor and rotate
        balance = self.get_balance(root)

        # TODO: Implement rotations for balance > 1 and balance < -1
        return root

    def get_height(self, root):
        return root.height if root else 0

    def get_balance(self, root):
        return self.get_height(root.left) - self.get_height(root.right) if root else 0

# Test with sequence [10, 20, 30, 40, 50, 25]
tree = AVLTree()
root = None
for val in [10, 20, 30, 40, 50, 25]:
    root = tree.insert(root, val)
print("AVL Root:", root.key)
""",
            "cpp": """#include <iostream>
#include <algorithm>
using namespace std;

struct Node {
    int key;
    Node *left = nullptr;
    Node *right = nullptr;
    int height = 1;
    Node(int k) : key(k) {}
};

int main() {
    cout << "AVL Tree C++ implementation ready." << endl;
    return 0;
}
"""
        },
        "supported_languages": ["python", "cpp", "c", "java"],
        "rubric": [
            {"criteria": "Correct Balance Factor Calculation", "max_points": 30.0, "description": "Accurately compute subtree height differences."},
            {"criteria": "Single & Double Rotation Logic", "max_points": 50.0, "description": "Proper pointer re-assignment for LL, RR, LR, RL cases."},
            {"criteria": "Code Readability & Test Coverage", "max_points": 20.0, "description": "Clean modular functions with clear naming."}
        ],
        "attachments": [],
        "deadline": now + timedelta(days=7),
        "max_marks": 100.0,
        "status": PracticalStatus.PUBLISHED,
        "created_by": teacher_user["id"],
        "created_at": now - timedelta(days=2),
        "updated_at": now - timedelta(days=2)
    })

    prac_dijkstra = await practical_repo.create({
        "course_id": course_dsa["id"],
        "lab_number": 2,
        "title": "Dijkstra's Shortest Path with Min-Heap Priority Queue",
        "objective": "Implement Dijkstra's Single Source Shortest Path algorithm on directed weighted graphs using a binary heap.",
        "instructions_md": """### Lab 2: Dijkstra's Algorithm

#### Objective
Compute the shortest path distances from source vertex $S$ to all reachable vertices in an adjacency-list graph $G=(V, E, W)$.
""",
        "starter_code": {
            "python": """import heapq

def dijkstra(graph, start_vertex):
    # graph: dict of {u: [(v, weight), ...]}
    distances = {node: float('inf') for node in graph}
    distances[start_vertex] = 0
    pq = [(0, start_vertex)]

    while pq:
        curr_dist, u = heapq.heappop(pq)
        if curr_dist > distances[u]:
            continue

        for v, weight in graph[u]:
            distance = curr_dist + weight
            if distance < distances[v]:
                distances[v] = distance
                heapq.heappush(pq, (distance, v))

    return distances
"""
        },
        "supported_languages": ["python", "cpp", "java"],
        "rubric": [
            {"criteria": "Correct Path Distances", "max_points": 60.0, "description": "Produces accurate shortest distance vectors."},
            {"criteria": "Time Complexity O((V+E)log V)", "max_points": 40.0, "description": "Utilizes min-heap priority queue efficiently."}
        ],
        "attachments": [],
        "deadline": now + timedelta(days=14),
        "max_marks": 100.0,
        "status": PracticalStatus.PUBLISHED,
        "created_by": teacher_user["id"],
        "created_at": now,
        "updated_at": now
    })

    # 5. Create a sample submission and teacher feedback for Alex on Lab 1
    sub_alex = await submission_repo.create({
        "practical_id": prac_bst["id"],
        "course_id": course_dsa["id"],
        "student_id": student_alex["id"],
        "language": "python",
        "code_content": """class Node:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None
        self.height = 1

class AVLTree:
    def insert(self, root, key):
        if not root:
            return Node(key)
        elif key < root.key:
            root.left = self.insert(root.left, key)
        else:
            root.right = self.insert(root.right, key)

        root.height = 1 + max(self.get_height(root.left), self.get_height(root.right))
        balance = self.get_balance(root)

        # Left Left
        if balance > 1 and key < root.left.key:
            return self.right_rotate(root)
        # Right Right
        if balance < -1 and key > root.right.key:
            return self.left_rotate(root)
        # Left Right
        if balance > 1 and key > root.left.key:
            root.left = self.left_rotate(root.left)
            return self.right_rotate(root)
        # Right Left
        if balance < -1 and key < root.right.key:
            root.right = self.right_rotate(root.right)
            return self.left_rotate(root)

        return root

    def left_rotate(self, z):
        y = z.right
        T2 = y.left
        y.left = z
        z.right = T2
        z.height = 1 + max(self.get_height(z.left), self.get_height(z.right))
        y.height = 1 + max(self.get_height(y.left), self.get_height(y.right))
        return y

    def right_rotate(self, z):
        y = z.left
        T3 = y.right
        y.right = z
        z.left = T3
        z.height = 1 + max(self.get_height(z.left), self.get_height(z.right))
        y.height = 1 + max(self.get_height(y.left), self.get_height(y.right))
        return y

    def get_height(self, root):
        return root.height if root else 0

    def get_balance(self, root):
        return self.get_height(root.left) - self.get_height(root.right) if root else 0

tree = AVLTree()
root = None
for val in [10, 20, 30, 40, 50, 25]:
    root = tree.insert(root, val)
print("AVL Root:", root.key)
""",
        "files": [{"name": "avl_tree.py", "size_bytes": 1820}],
        "output_text": "AVL Root: 30\nIn-order Traversal: 10 20 25 30 40 50\nTree balanced with height: 3",
        "output_images": [],
        "student_notes": "Implemented all 4 rotation cases. Output verified on sample inputs.",
        "status": SubmissionStatus.REVIEWED,
        "version": 1,
        "submitted_at": now - timedelta(days=1),
        "marks_obtained": 96.0,
        "feedback_id": None,
        "created_at": now - timedelta(days=1),
        "updated_at": now - timedelta(hours=10)
    })

    # Add feedback from Dr. Eleanor Sterling
    fb = await feedback_repo.create({
        "submission_id": sub_alex["id"],
        "practical_id": prac_bst["id"],
        "teacher_id": teacher_user["id"],
        "marks": 96.0,
        "rubric_scores": [
            {"criteria": "Correct Balance Factor Calculation", "score": 30.0, "max_points": 30.0, "feedback": "Flawless balance calculation."},
            {"criteria": "Single & Double Rotation Logic", "score": 48.0, "max_points": 50.0, "feedback": "Clean rotation helper routines."},
            {"criteria": "Code Readability & Test Coverage", "score": 18.0, "max_points": 20.0, "feedback": "Well organized."}
        ],
        "comments": "Great work Alex! Your double rotation handling was structured very cleanly.",
        "line_comments": [
            {"line": 42, "comment": "Nice height recalculation ordering after rotation."}
        ],
        "reviewed_at": now - timedelta(hours=10),
        "created_at": now - timedelta(hours=10),
        "updated_at": now - timedelta(hours=10)
    })

    await submission_repo.update(sub_alex["id"], {"feedback_id": fb["id"]})
