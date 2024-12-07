import Link from "next/link";

const projects = [
    { name: 'Alpha' },
    { name: 'Beta' },
    { name: 'Gamma' },
    // { name: 'Gamma' },
    // { name: 'Gamma' },
    // { name: 'Gamma' },
    // { name: 'Gamma' },
    // { name: 'Gamma' },
    // { name: 'Gamma' },
    // { name: 'Gamma' },
    // { name: 'Gamma' },
    // { name: 'Gamma' },
    // { name: 'Gamma' },
];

export default function Projects() {
  return <div className="flex flex-col gap-2 max-h-[50vh] border-4 border-green-900 overflow-y-scroll">
     {projects.map((project,i) => {
        return <Link key={i} href={'/dashboard'} className="flex items-center gap-2 p-2 rounded-lg border-2 border-red-900">
              <span className="px-2 py-1 border rounded-sm">{project.name[0]}</span>
              <p className="truncate text-sm">{project.name}</p>
        </Link>
     })} 
  </div>
}