import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, BookOpen } from "lucide-react"
import Link from "next/link"

export default function QuickActions() {
  const actions = [
    {
      title: "View Calendar",
      description: "See upcoming deadlines",
      icon: Calendar,
      href: "/calendar",
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Section Tasks",
      description: "View section assignments",
      icon: Users,
      href: "/section-tasks",
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "Study Materials",
      description: "Access resources",
      icon: BookOpen,
      href: "/resources",
      color: "bg-orange-600 hover:bg-orange-700",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow bg-transparent"
              >
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
