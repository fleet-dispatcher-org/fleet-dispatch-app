

interface RoleBadgeColorProps {
    role: string
}

export default function RoleBadgeColor({ role }: RoleBadgeColorProps) {
     return (
        <div className="flex justify-center">
        <span className={`px-3 py-1 text-sm rounded-full ${
          role === 'ADMIN' ? 'bg-red-100 text-red-800' :
          role === 'DISPATCHER' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {role}
        </span>
      </div>
     )
}