'use client';

import React, { useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/context/ToastContext';
import {
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Code2,
  FileCode2,
  FlaskConical,
  Play,
  Plus,
  Send,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';

type ClassItem = {
  id: string;
  code: string;
  title: string;
  instructor: string;
  progress: number;
  nextLab: string;
  due: string;
  color: string;
};

const classes: ClassItem[] = [
  {
    id: 'cs301',
    code: 'CS301',
    title: 'Data Structures & Algorithms',
    instructor: 'Dr. Eleanor Sterling',
    progress: 72,
    nextLab: 'Graph Traversal with BFS',
    due: 'Due tomorrow',
    color: 'indigo',
  },
  {
    id: 'cs205',
    code: 'CS205',
    title: 'Object Oriented Programming',
    instructor: 'Prof. Marcus Lee',
    progress: 48,
    nextLab: 'Inheritance & Polymorphism',
    due: 'Due in 4 days',
    color: 'emerald',
  },
  {
    id: 'cs220',
    code: 'CS220',
    title: 'Database Systems',
    instructor: 'Dr. Priya Nair',
    progress: 61,
    nextLab: 'Query Optimization',
    due: 'Due next week',
    color: 'violet',
  },
];

const starterCode = `from collections import deque

def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbour in graph[node]:
            if neighbour not in visited:
                visited.add(neighbour)
                queue.append(neighbour)

    return order

graph = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": ["E"],
    "D": [],
    "E": [],
}
print(bfs(graph, "A"))`;

const initialTodos = [
  { id: 1, title: 'Finish BFS graph traversal lab', meta: 'CS301 · Due tomorrow', done: false },
  { id: 2, title: 'Review polymorphism lecture notes', meta: 'CS205 · 20 min estimate', done: false },
  { id: 3, title: 'Submit database normalization worksheet', meta: 'CS220 · Submitted', done: true },
];

const toneClasses = {
  indigo: {
    icon: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    bar: 'bg-indigo-500',
  },
  emerald: {
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    bar: 'bg-emerald-500',
  },
  violet: {
    icon: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    bar: 'bg-violet-500',
  },
} as const;

export default function StudentWorkspacePage() {
  const { success, info } = useToast();
  const [selectedClassId, setSelectedClassId] = useState(classes[0].id);
  const [code, setCode] = useState(starterCode);
  const [todos, setTodos] = useState(initialTodos);
  const [output, setOutput] = useState('Ready when you are. Run your code to see output here.');
  const [isRunning, setIsRunning] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'workspace'>('overview');

  const selectedClass = useMemo(
    () => classes.find((item) => item.id === selectedClassId) || classes[0],
    [selectedClassId]
  );
  const completedTodos = todos.filter((todo) => todo.done).length;

  const openWorkspace = (classId: string) => {
    setSelectedClassId(classId);
    setActiveView('workspace');
  };

  const toggleTodo = (id: number) => {
    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
    );
  };

  const runCode = () => {
    setIsRunning(true);
    setOutput('$ python solution.py\n\nRunning tests for Graph Traversal with BFS...\n✓ Test 1: visits nodes in breadth-first order (12ms)\n✓ Test 2: handles disconnected nodes (8ms)\n✓ Test 3: handles an empty graph (5ms)\n\n[3/3 tests passed]  All checks complete.');
    window.setTimeout(() => setIsRunning(false), 650);
  };

  return (
    <AppLayout>
      <div className="space-y-7">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-indigo-50/60 to-violet-100/60 p-6 shadow-sm dark:border-slate-800/80 dark:from-slate-900 dark:via-indigo-950/40 dark:to-violet-950/30 sm:p-8">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-4 w-4" />
                Student workspace
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Good morning, Alex.
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Keep your practicals moving. You have one assignment due tomorrow and three labs in progress.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-center backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">82%</p>
                <p className="text-[11px] font-medium text-slate-500">Semester progress</p>
              </div>
              <Button variant="primary" onClick={() => document.getElementById('classes')?.scrollIntoView({ behavior: 'smooth' })} rightIcon={<ArrowUpRight className="h-4 w-4" />}>
                Continue learning
              </Button>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
          {(['overview', 'workspace'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`border-b-2 px-4 py-3 text-xs font-bold capitalize transition-colors ${
                activeView === view
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {view === 'overview' ? 'My overview' : 'Coding workspace'}
            </button>
          ))}
        </div>

        {activeView === 'overview' ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Active classes', value: '3', detail: '12 practicals assigned', icon: BookOpen, tone: 'indigo' },
                { label: 'To-do progress', value: `${completedTodos}/${todos.length}`, detail: 'Keep up the momentum', icon: CheckCircle2, tone: 'emerald' },
                { label: 'Hours this week', value: '8.5', detail: '+12% from last week', icon: Clock3, tone: 'violet' },
              ].map(({ label, value, detail, icon: Icon, tone }) => (
                <Card key={label} className="flex items-center gap-4 p-5">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClasses[tone as keyof typeof toneClasses].icon}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                    <p className="text-[11px] text-slate-400">{detail}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <Card id="classes" className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200/80 p-5 dark:border-slate-800">
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white">Your classes</h2>
                    <p className="mt-1 text-xs text-slate-500">Open a class to enter its coding lab.</p>
                  </div>
                  <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    View all <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {classes.map((course) => (
                    <button key={course.id} onClick={() => openWorkspace(course.id)} className="group flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/60">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${toneClasses[course.color as keyof typeof toneClasses].icon} text-sm font-extrabold`}>
                        {course.code.slice(2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{course.code}</span>
                          <Badge variant={course.due.includes('tomorrow') ? 'warning' : 'default'} size="sm">{course.due}</Badge>
                        </div>
                        <h3 className="mt-1 truncate text-sm font-bold text-slate-900 dark:text-white">{course.title}</h3>
                        <p className="mt-1 text-xs text-slate-500">{course.instructor} · Next: {course.nextLab}</p>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${toneClasses[course.color as keyof typeof toneClasses].bar}`} style={{ width: `${course.progress}%` }} /></div>
                          <span className="text-[11px] font-bold text-slate-500">{course.progress}%</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500" />
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="h-fit">
                <div className="flex items-center justify-between border-b border-slate-200/80 p-5 dark:border-slate-800">
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white">My to-do list</h2>
                    <p className="mt-1 text-xs text-slate-500">{completedTodos} of {todos.length} complete</p>
                  </div>
                  <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-500 dark:hover:bg-slate-800"><Plus className="h-4 w-4" /></button>
                </div>
                <div className="space-y-1 p-3">
                  {todos.map((todo) => (
                    <button key={todo.id} onClick={() => toggleTodo(todo.id)} className="flex w-full items-start gap-3 rounded-xl p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900">
                      {todo.done ? <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white"><Check className="h-3 w-3" /></span> : <Circle className="mt-0.5 h-4 w-4 text-slate-300" />}
                      <span className="min-w-0">
                        <span className={`block text-xs font-semibold ${todo.done ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{todo.title}</span>
                        <span className="mt-1 block text-[11px] text-slate-400">{todo.meta}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </>
        ) : (
          <Card className="overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-slate-200/80 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500"><FlaskConical className="h-5 w-5" /></div>
                <div>
                  <div className="flex items-center gap-2"><span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">{selectedClass.code} · Practical 04</span><Badge variant="warning" size="sm">{selectedClass.due}</Badge></div>
                  <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{selectedClass.nextLab}</h2>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setCode(starterCode); info('Workspace reset', 'Starter code has been restored.'); }} leftIcon={<X className="h-3.5 w-3.5" />}>Reset</Button>
                <Button variant="primary" size="sm" onClick={() => { success('Assignment submitted', 'Your solution is now with your instructor.'); }} leftIcon={<Send className="h-3.5 w-3.5" />}>Submit work</Button>
              </div>
            </div>
            <div className="grid min-h-[620px] lg:grid-cols-[280px_1fr]">
              <aside className="border-b border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 lg:border-b-0 lg:border-r">
                <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"><FileCode2 className="h-4 w-4" /> Lab brief</div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Breadth-first search</h3>
                <p className="mt-3 text-xs leading-5 text-slate-500">Implement BFS to visit every node in a graph, starting from a given node. Your solution should handle cycles and disconnected nodes.</p>
                <div className="mt-6 space-y-3">
                  {['Implement bfs(graph, start)', 'Run all test cases', 'Submit before the deadline'].map((item, index) => <div key={item} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">{index + 1}</span>{item}</div>)}
                </div>
                <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 dark:border-indigo-900/60 dark:bg-indigo-950/30"><p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">Tip</p><p className="mt-1 text-[11px] leading-4 text-indigo-600/80 dark:text-indigo-300/70">Use a queue and a visited set to avoid processing a node more than once.</p></div>
              </aside>
              <div className="flex min-w-0 flex-col bg-[#0b1120]">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3"><div className="flex items-center gap-2 text-xs font-semibold text-slate-300"><Code2 className="h-4 w-4 text-indigo-400" /> solution.py <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500">Python 3.11</span></div><Button variant="primary" size="sm" onClick={runCode} disabled={isRunning} leftIcon={<Play className="h-3.5 w-3.5" />}>{isRunning ? 'Running...' : 'Run code'}</Button></div>
                <textarea value={code} onChange={(event) => setCode(event.target.value)} spellCheck={false} aria-label="Code editor" className="min-h-[370px] flex-1 resize-none border-0 bg-[#0b1120] p-5 font-mono text-[13px] leading-6 text-slate-300 outline-none focus:ring-0" />
                <div className="border-t border-slate-800 bg-[#080d18]"><div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500"><Terminal className="h-3.5 w-3.5" /> Terminal output</div><pre className="min-h-[150px] whitespace-pre-wrap p-4 font-mono text-xs leading-5 text-emerald-400">{output}</pre></div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
