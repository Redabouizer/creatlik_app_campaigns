"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Avatar,
  Chip,
  Button,
} from "@material-tailwind/react"
import { StarIcon, MapPinIcon } from "@heroicons/react/24/outline"
import { mockCreators } from "../../services/mock-data-service"

export function Creators() {
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Use mock creators directly
    setCreators(mockCreators || [])
    setLoading(false)
  }, [])

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Creator Directory
          </Typography>
          <Typography variant="small" color="white" className="mt-1 font-normal">
            List of all creators
          </Typography>
        </CardHeader>
        <CardBody className="px-4">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Typography>Loading...</Typography>
            </div>
          ) : creators.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <Typography>No creators available</Typography>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {creators.map((creator) => (
                <Card key={creator.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader
                    floated={false}
                    shadow={false}
                    color="transparent"
                    className="m-0 p-6 bg-gradient-to-r from-blue-50 to-blue-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar
                          src={
                            creator.photoURL ||
                            `https://ui-avatars.com/api/?name=${creator.firstName}+${creator.lastName}&background=0D8ABC&color=fff`
                          }
                          alt={`${creator.firstName} ${creator.lastName}`}
                          size="lg"
                          className="border-2 border-white"
                        />
                        <div>
                          <Typography variant="h6" color="blue-gray">
                            {creator.firstName} {creator.lastName}
                          </Typography>
                          <div className="flex items-center gap-2">
                            <Rating value={creator.rating || 0} readonly />
                            <Typography color="blue-gray" className="font-medium text-sm">
                              {creator.rating || 0} ({creator.reviewCount || 0})
                            </Typography>
                          </div>
                          {creator.location && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPinIcon className="h-3 w-3 text-blue-gray-500" />
                              <Typography variant="small" color="blue-gray" className="text-xs">
                                {creator.location}
                              </Typography>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="p-6">
                    <div className="mb-4">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {creator.bio || "No bio available"}
                      </Typography>
                    </div>

                    {creator.categories && creator.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {creator.categories.map((category) => (
                          <Chip
                            key={category}
                            value={category}
                            variant="ghost"
                            color="blue"
                            size="sm"
                            className="capitalize"
                          />
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default Creators