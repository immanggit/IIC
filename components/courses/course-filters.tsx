"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface CourseFiltersProps {
  selectedLevel: string
  selectedSort: string
  showRecommended: boolean
  showPopular: boolean
  onFilterChange: (type: string, value: string | boolean) => void
}

export default function CourseFilters({
  selectedLevel,
  selectedSort,
  showRecommended,
  showPopular,
  onFilterChange,
}: CourseFiltersProps) {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Level</Label>
          <RadioGroup
            value={selectedLevel}
            onValueChange={(value) => onFilterChange("level", value)}
            className="space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="level-all" />
              <Label htmlFor="level-all" className="cursor-pointer">
                All Levels
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Beginner" id="level-beginner" />
              <Label htmlFor="level-beginner" className="cursor-pointer">
                Beginner
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Intermediate" id="level-intermediate" />
              <Label htmlFor="level-intermediate" className="cursor-pointer">
                Intermediate
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Advanced" id="level-advanced" />
              <Label htmlFor="level-advanced" className="cursor-pointer">
                Advanced
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Sort By</Label>
          <Select value={selectedSort} onValueChange={(value) => onFilterChange("sort", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended First</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="a-z">A-Z</SelectItem>
              <SelectItem value="z-a">Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="recommended" className="cursor-pointer">
              Recommended Courses
            </Label>
            <Switch
              id="recommended"
              checked={showRecommended}
              onCheckedChange={(checked) => onFilterChange("recommended", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="popular" className="cursor-pointer">
              Popular Courses
            </Label>
            <Switch
              id="popular"
              checked={showPopular}
              onCheckedChange={(checked) => onFilterChange("popular", checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

