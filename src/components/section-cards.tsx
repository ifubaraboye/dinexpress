import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-red-50/50 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-black tabular-nums @[250px]/card:text-3xl tracking-tighter">
            ₦1,250,400
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600 border-green-100 bg-green-50">
              <IconTrendingUp size={14} />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs">
          <div className="line-clamp-1 flex gap-2 font-medium text-gray-500">
            Trending up this month <IconTrendingUp className="size-4" />
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card border-red-50">
        <CardHeader>
          <CardDescription className="text-red-600 font-bold">New Customers</CardDescription>
          <CardTitle className="text-2xl font-black tabular-nums @[250px]/card:text-3xl tracking-tighter">
            1,234
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-red-600 border-red-100 bg-red-50">
              <IconTrendingDown size={14} />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs">
          <div className="line-clamp-1 flex gap-2 font-medium text-gray-500">
            Down 20% this period <IconTrendingDown className="size-4" />
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Runners</CardDescription>
          <CardTitle className="text-2xl font-black tabular-nums @[250px]/card:text-3xl tracking-tighter">
            456
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-red-600 border-red-100 bg-red-50">
              <IconTrendingUp size={14} />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs">
          <div className="line-clamp-1 flex gap-2 font-medium text-gray-500">
            Strong runner retention <IconTrendingUp className="size-4" />
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Success Rate</CardDescription>
          <CardTitle className="text-2xl font-black tabular-nums @[250px]/card:text-3xl tracking-tighter">
            98.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600 border-green-100 bg-green-50">
              <IconTrendingUp size={14} />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs">
          <div className="line-clamp-1 flex gap-2 font-medium text-gray-500">
            Steady performance increase <IconTrendingUp className="size-4" />
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
