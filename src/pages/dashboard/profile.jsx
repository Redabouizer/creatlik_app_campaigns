"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardBody,
  Avatar,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
  Switch,
  Button,
  Spinner,
  Badge,
  IconButton,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
  Chip,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
} from "@material-tailwind/react"
import {
  UserCircleIcon,
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CameraIcon,
  CheckCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
  LockClosedIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/solid"
import { Link } from "react-router-dom"
import { fetchUserProfile, fetchRecentActivities, subscribeToNotifications } from "../../services/firebase-service"
import { auth } from "../../firebase/config"
import { doc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../../firebase/config"

export function Profile() {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogType, setDialogType] = useState("")
  const [dialogData, setDialogData] = useState({})
  const [alert, setAlert] = useState({ show: false, message: "", color: "green" })
  const [activities, setActivities] = useState([])
  const [notifications, setNotifications] = useState([])
  const [securityData, setSecurityData] = useState({
    twoFactorEnabled: false,
    connectedDevices: [],
    loginHistory: [],
  })

  // Form data for quick edits
  const [editFormData, setEditFormData] = useState({
    bio: "",
    location: "",
    phoneNumber: "",
  })

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true)
      try {
        const currentUser = auth.currentUser
        if (currentUser) {
          const { success, data } = await fetchUserProfile(currentUser.uid)
          if (success) {
            setUserData(data)
            setEditFormData({
              bio: data.bio || "",
              location: data.location || "",
              phoneNumber: data.phoneNumber || "",
            })

            // Load security data if available
            if (data.security) {
              setSecurityData({
                ...securityData,
                ...data.security,
              })
            } else {
              // Set default security data
              setSecurityData({
                twoFactorEnabled: false,
                connectedDevices: [
                  {
                    id: "device1",
                    name: "Current Device",
                    type: "desktop",
                    lastActive: new Date().toISOString(),
                    isCurrent: true,
                  },
                ],
                loginHistory: [
                  {
                    id: "login1",
                    device: "Current Device",
                    location: "Current Location",
                    time: new Date().toISOString(),
                    status: "success",
                  },
                ],
              })
            }

            // Load activities
            const { data: activitiesData } = await fetchRecentActivities(currentUser.uid)
            setActivities(activitiesData || [])

            // Subscribe to notifications
            const unsubscribe = subscribeToNotifications(currentUser.uid, (notifs) => {
              setNotifications(notifs || [])
            })

            return () => {
              if (unsubscribe) unsubscribe()
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  const showAlert = (message, color = "green") => {
    setAlert({ show: true, message, color })
    setTimeout(() => {
      setAlert({ show: false, message: "", color })
    }, 5000)
  }

  const openModal = (type, data = {}) => {
    setDialogType(type)
    setDialogData(data)
    setOpenDialog(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditFormData({
      ...editFormData,
      [name]: value,
    })
  }

  const updateBio = async () => {
    setSaving(true)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error("No user logged in")

      const userRef = doc(db, "users", currentUser.uid)
      await updateDoc(userRef, {
        bio: editFormData.bio,
        updatedAt: new Date(),
      })

      // Update local state
      setUserData({
        ...userData,
        bio: editFormData.bio,
      })

      // Add activity log
      await addDoc(collection(db, "activities"), {
        userId: currentUser.uid,
        action: "bio_update",
        timestamp: serverTimestamp(),
        details: "Bio information updated",
      })

      showAlert("Bio updated successfully")
      setOpenDialog(false)
    } catch (error) {
      console.error("Error updating bio:", error)
      showAlert("Failed to update bio", "red")
    } finally {
      setSaving(false)
    }
  }

  const updateContactInfo = async () => {
    setSaving(true)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error("No user logged in")

      const userRef = doc(db, "users", currentUser.uid)
      await updateDoc(userRef, {
        location: editFormData.location,
        phoneNumber: editFormData.phoneNumber,
        updatedAt: new Date(),
      })

      // Update local state
      setUserData({
        ...userData,
        location: editFormData.location,
        phoneNumber: editFormData.phoneNumber,
      })

      // Add activity log
      await addDoc(collection(db, "activities"), {
        userId: currentUser.uid,
        action: "contact_update",
        timestamp: serverTimestamp(),
        details: "Contact information updated",
      })

      showAlert("Contact information updated successfully")
      setOpenDialog(false)
    } catch (error) {
      console.error("Error updating contact info:", error)
      showAlert("Failed to update contact information", "red")
    } finally {
      setSaving(false)
    }
  }

  const markAllNotificationsAsRead = async () => {
    try {
      // In a real app, you would update the notifications in the database
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
      showAlert("All notifications marked as read")
    } catch (error) {
      console.error("Error marking notifications as read:", error)
      showAlert("Failed to mark notifications as read", "red")
    }
  }

  const renderDialog = () => {
    switch (dialogType) {
      case "editBio":
        return (
          <Dialog open={openDialog} handler={() => setOpenDialog(false)}>
            <DialogHeader>Edit Bio</DialogHeader>
            <DialogBody>
              <Textarea label="Bio" name="bio" value={editFormData.bio} onChange={handleInputChange} rows={4} />
            </DialogBody>
            <DialogFooter>
              <Button variant="text" color="blue-gray" onClick={() => setOpenDialog(false)} className="mr-1">
                Cancel
              </Button>
              <Button color="blue" onClick={updateBio} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </Dialog>
        )

      case "editContact":
        return (
          <Dialog open={openDialog} handler={() => setOpenDialog(false)}>
            <DialogHeader>Edit Contact Information</DialogHeader>
            <DialogBody>
              <div className="grid gap-6">
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  value={editFormData.phoneNumber}
                  onChange={handleInputChange}
                />
                <Input label="Location" name="location" value={editFormData.location} onChange={handleInputChange} />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="text" color="blue-gray" onClick={() => setOpenDialog(false)} className="mr-1">
                Cancel
              </Button>
              <Button color="blue" onClick={updateContactInfo} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </Dialog>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-12 w-12" />
      </div>
    )
  }

  return (
    <>
      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 bg-${alert.color}-500 text-white px-6 py-3 rounded-lg shadow-lg`}>
          {alert.message}
        </div>
      )}

      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/25" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <div className="mb-10 flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar
                  src={userData?.photoURL || "/img/default-avatar.png"}
                  alt={userData?.displayName || "User"}
                  size="xl"
                  variant="rounded"
                  className="rounded-lg shadow-lg shadow-blue-gray-500/40"
                />
                <IconButton size="sm" color="blue" className="absolute -bottom-1.5 -right-1.5 rounded-full">
                  <CameraIcon className="h-4 w-4" />
                </IconButton>
              </div>
              <div>
                <Typography variant="h5" color="blue-gray" className="mb-1">
                  {userData?.displayName || userData?.firstName + " " + userData?.lastName || "User"}
                </Typography>
                <div className="flex items-center gap-2">
                  <Typography variant="small" className="font-normal text-blue-gray-600">
                    {userData?.bio || "No bio available"}
                  </Typography>
                  <Chip
                    size="sm"
                    value={userData?.userType === "brand" ? "Brand" : "Creator"}
                    color="indigo"
                    className="capitalize"
                  />
                </div>
              </div>
            </div>
          </div>

          {activeTab === "profile" && (
            <div className="gird-cols-1 mb-12 grid gap-12 px-4 lg:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Typography variant="h6" color="blue-gray">
                    Profile Information
                  </Typography>
                  <IconButton variant="text" color="blue" onClick={() => openModal("editBio")}>
                    <PencilIcon className="h-4 w-4" />
                  </IconButton>
                </div>

                <Card className="shadow-md border border-blue-gray-100 hover:shadow-lg transition-shadow">
                  <CardBody>
                    <div className="mb-6">
                      <Typography variant="small" color="blue-gray" className="font-semibold mb-2">
                        Bio
                      </Typography>
                      <Typography variant="small" className="text-blue-gray-500">
                        {userData?.bio || "No bio available"}
                      </Typography>
                    </div>

                    <div>
                      <Typography variant="small" color="blue-gray" className="font-semibold mb-2">
                        Full Name
                      </Typography>
                      <Typography variant="small" className="text-blue-gray-500">
                        {userData?.displayName || userData?.firstName + " " + userData?.lastName || "User"}
                      </Typography>
                    </div>

                    <div className="mt-4">
                      <Typography variant="small" color="blue-gray" className="font-semibold mb-2">
                        Account Type
                      </Typography>
                      <div className="flex items-center gap-2">
                        <Chip
                          size="sm"
                          value={userData?.userType === "brand" ? "Brand" : "Creator"}
                          color="indigo"
                          className="capitalize"
                        />
                        {userData?.verificationStatus && (
                          <Badge color="green" className="flex items-center gap-1 rounded-full py-1 px-2 text-xs">
                            <CheckBadgeIcon className="h-3 w-3" /> Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Typography variant="small" color="blue-gray" className="font-semibold mb-2">
                        Member Since
                      </Typography>
                      <Typography variant="small" className="text-blue-gray-500">
                        {userData?.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : "N/A"}
                      </Typography>
                    </div>
                  </CardBody>
                </Card>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="h6" color="blue-gray">
                      Recent Activities
                    </Typography>
                    <Button variant="text" size="sm" className="flex items-center gap-2">
                      <ArrowPathIcon className="h-4 w-4" /> Refresh
                    </Button>
                  </div>

                  <Card className="shadow-md border border-blue-gray-100 hover:shadow-lg transition-shadow">
                    <CardBody>
                      {activities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6">
                          <ClockIcon className="h-12 w-12 text-blue-gray-300 mb-2" />
                          <Typography variant="h6" color="blue-gray">
                            No recent activities
                          </Typography>
                          <Typography variant="small" className="text-blue-gray-500 text-center max-w-md">
                            Your recent account activities will appear here
                          </Typography>
                        </div>
                      ) : (
                        <List>
                          {activities.slice(0, 5).map((activity) => (
                            <ListItem key={activity.id} className="py-2">
                              <ListItemPrefix>
                                <div className="rounded-full bg-indigo-100 p-2">
                                  <ClockIcon className="h-4 w-4 text-indigo-500" />
                                </div>
                              </ListItemPrefix>
                              <div>
                                <Typography variant="small" color="blue-gray" className="font-medium">
                                  {activity.details || activity.action}
                                </Typography>
                                <Typography variant="small" className="text-blue-gray-500 text-xs">
                                  {activity.timestamp
                                    ? new Date(activity.timestamp.seconds * 1000).toLocaleString()
                                    : "N/A"}
                                </Typography>
                              </div>
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </CardBody>
                  </Card>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Typography variant="h6" color="blue-gray">
                    Contact Information
                  </Typography>
                  <IconButton variant="text" color="blue" onClick={() => openModal("editContact")}>
                    <PencilIcon className="h-4 w-4" />
                  </IconButton>
                </div>

                <Card className="shadow-md border border-blue-gray-100 hover:shadow-lg transition-shadow">
                  <CardBody>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <div className="rounded-md bg-indigo-50 p-2">
                          <EnvelopeIcon className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            Email
                          </Typography>
                          <Typography variant="small" className="text-blue-gray-500">
                            {userData?.email || "Not provided"}
                          </Typography>
                        </div>
                        {userData?.emailVerified && (
                          <Badge color="green" className="flex items-center gap-1 rounded-full py-1 px-2 text-xs">
                            <CheckCircleIcon className="h-3 w-3" /> Verified
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="rounded-md bg-indigo-50 p-2">
                          <PhoneIcon className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            Phone
                          </Typography>
                          <Typography variant="small" className="text-blue-gray-500">
                            {userData?.phoneNumber || "Not provided"}
                          </Typography>
                        </div>
                        {userData?.phoneVerified && (
                          <Badge color="green" className="flex items-center gap-1 rounded-full py-1 px-2 text-xs">
                            <CheckCircleIcon className="h-3 w-3" /> Verified
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="rounded-md bg-indigo-50 p-2">
                          <MapPinIcon className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            Location
                          </Typography>
                          <Typography variant="small" className="text-blue-gray-500">
                            {userData?.location || "Not provided"}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {userData?.userType === "brand" && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <Typography variant="h6" color="blue-gray">
                        Brand Information
                      </Typography>
                      <Link to="/dashboard/settings">
                        <Button variant="text" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>

                    <Card className="shadow-md border border-blue-gray-100 hover:shadow-lg transition-shadow">
                      <CardBody>
                        <div className="grid gap-4">
                          <div>
                            <Typography variant="small" color="blue-gray" className="font-semibold">
                              Company Name
                            </Typography>
                            <Typography variant="small" className="text-blue-gray-500">
                              {userData?.companyName || userData?.displayName || "Not provided"}
                            </Typography>
                          </div>

                          <div>
                            <Typography variant="small" color="blue-gray" className="font-semibold">
                              Industry
                            </Typography>
                            <Typography variant="small" className="text-blue-gray-500 capitalize">
                              {userData?.industry || "Not specified"}
                            </Typography>
                          </div>

                          <div>
                            <Typography variant="small" color="blue-gray" className="font-semibold">
                              Website
                            </Typography>
                            <Typography variant="small" className="text-blue-gray-500">
                              {userData?.websiteUrl ? (
                                <a
                                  href={userData.websiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-500 hover:underline"
                                >
                                  {userData.websiteUrl}
                                </a>
                              ) : (
                                "Not provided"
                              )}
                            </Typography>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                )}

                <div className="mt-6">
                  <Link to="/dashboard/settings">
                    <Button color="indigo" className="w-full">
                      Edit Profile Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h6" color="blue-gray">
                  Notifications
                </Typography>
                <div className="flex gap-2">
                  <Button size="sm" color="indigo" onClick={markAllNotificationsAsRead}>
                    Mark All as Read
                  </Button>
                  <Button size="sm" variant="outlined" color="indigo">
                    Clear All
                  </Button>
                </div>
              </div>

              <Card className="shadow-md border border-blue-gray-100 hover:shadow-lg transition-shadow">
                <CardBody>
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <BellIcon className="h-12 w-12 text-blue-gray-300 mb-2" />
                      <Typography variant="h6" color="blue-gray">
                        No notifications
                      </Typography>
                      <Typography variant="small" className="text-blue-gray-500 text-center max-w-md">
                        You don't have any notifications yet
                      </Typography>
                      <Button variant="text" color="indigo" className="mt-4 flex items-center gap-2">
                        <ArrowPathIcon className="h-4 w-4" /> Refresh
                      </Button>
                    </div>
                  ) : (
                    <List>
                      {notifications.map((notification) => (
                        <ListItem key={notification.id} className={notification.read ? "" : "bg-indigo-50"}>
                          <ListItemPrefix>
                            {notification.type === "security" && (
                              <div className="rounded-full bg-red-100 p-2">
                                <ShieldCheckIcon className="h-5 w-5 text-red-500" />
                              </div>
                            )}
                            {notification.type === "account" && (
                              <div className="rounded-full bg-indigo-100 p-2">
                                <UserCircleIcon className="h-5 w-5 text-indigo-500" />
                              </div>
                            )}
                            {notification.type === "system" && (
                              <div className="rounded-full bg-blue-gray-100 p-2">
                                <BellIcon className="h-5 w-5 text-blue-gray-500" />
                              </div>
                            )}
                          </ListItemPrefix>
                          <div>
                            <Typography variant="small" color="blue-gray" className="font-medium">
                              {notification.title || notification.message}
                            </Typography>
                            <Typography variant="small" color="blue-gray" className="flex items-center gap-1 text-xs">
                              <ClockIcon className="h-3.5 w-3.5" />{" "}
                              {new Date(notification.time || notification.createdAt).toLocaleString()}
                            </Typography>
                          </div>
                          <ListItemSuffix>
                            {!notification.read && <Badge color="indigo" className="h-2 w-2 rounded-full" />}
                          </ListItemSuffix>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardBody>
              </Card>

              <div className="mt-6">
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  Notification Settings
                </Typography>
                <Card className="shadow-md border border-blue-gray-100 hover:shadow-lg transition-shadow">
                  <CardBody>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            Email Notifications
                          </Typography>
                          <Typography variant="small" className="text-blue-gray-500">
                            Receive email updates about your account
                          </Typography>
                        </div>
                        <Switch defaultChecked={userData?.settings?.emailNotifications} color="indigo" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            Push Notifications
                          </Typography>
                          <Typography variant="small" className="text-blue-gray-500">
                            Receive push notifications on your device
                          </Typography>
                        </div>
                        <Switch defaultChecked={userData?.settings?.pushNotifications} color="indigo" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            SMS Notifications
                          </Typography>
                          <Typography variant="small" className="text-blue-gray-500">
                            Receive text messages for important updates
                          </Typography>
                        </div>
                        <Switch defaultChecked={userData?.settings?.smsNotifications} color="indigo" />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="px-4 pb-4">
              <Typography variant="h6" color="blue-gray" className="mb-4">
                Security Overview
              </Typography>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-md border border-blue-gray-100 hover:shadow-lg transition-shadow">
                  <CardBody>
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-full p-3 ${securityData.twoFactorEnabled ? "bg-green-100" : "bg-blue-gray-100"}`}
                      >
                        <LockClosedIcon
                          className={`h-6 w-6 ${securityData.twoFactorEnabled ? "text-green-500" : "text-blue-gray-500"}`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Typography variant="h6" color="blue-gray">
                            Two-Factor Authentication
                          </Typography>
                          <Chip
                            size="sm"
                            variant="ghost"
                            color={securityData.twoFactorEnabled ? "green" : "blue-gray"}
                            value={securityData.twoFactorEnabled ? "Enabled" : "Disabled"}
                          />
                        </div>
                        <Typography variant="small" className="text-blue-gray-500">
                          {securityData.twoFactorEnabled
                            ? "Your account is protected with two-factor authentication."
                            : "Add an extra layer of security to your account."}
                        </Typography>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link to="/dashboard/settings">
                        <Button color="indigo" size="sm" fullWidth>
                          {securityData.twoFactorEnabled ? "Manage 2FA" : "Enable 2FA"}
                        </Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>

                <Card className="shadow-md border border-blue-gray-100 hover:shadow-lg transition-shadow">
                  <CardBody>
                    <Typography variant="h6" color="blue-gray" className="mb-4">
                      Password
                    </Typography>
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          Last Changed
                        </Typography>
                        <Typography variant="small" className="text-blue-gray-500">
                          {userData?.passwordLastChanged
                            ? new Date(userData.passwordLastChanged.seconds * 1000).toLocaleDateString()
                            : "Never"}
                        </Typography>
                      </div>
                      <Link to="/dashboard/settings">
                        <Button variant="text" color="indigo" size="sm">
                          Change Password
                        </Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              </div>

              <Typography variant="h6" color="blue-gray" className="mt-6 mb-4">
                Connected Devices
              </Typography>

              <Card className="shadow-md border border-blue-gray-100 hover:shadow-lg transition-shadow">
                <CardBody>
                  {securityData.connectedDevices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <DevicePhoneMobileIcon className="h-12 w-12 text-blue-gray-300 mb-2" />
                      <Typography variant="h6" color="blue-gray">
                        No devices connected
                      </Typography>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {securityData.connectedDevices.map((device) => (
                        <div key={device.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="rounded-full bg-indigo-100 p-2">
                              {device.type === "mobile" ? (
                                <DevicePhoneMobileIcon className="h-5 w-5 text-indigo-500" />
                              ) : (
                                <ComputerDesktopIcon className="h-5 w-5 text-indigo-500" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                  {device.name}
                                </Typography>
                                {device.isCurrent && (
                                  <Chip size="sm" value="Current Device" color="green" variant="ghost" />
                                )}
                              </div>
                              <Typography variant="small" className="text-blue-gray-500 flex items-center gap-1">
                                <ClockIcon className="h-3.5 w-3.5" /> Last active:{" "}
                                {new Date(device.lastActive).toLocaleString()}
                              </Typography>
                            </div>
                          </div>
                          {!device.isCurrent && (
                            <Button size="sm" color="red" variant="text">
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>

              <div className="mt-6">
                <Link to="/dashboard/settings">
                  <Button color="indigo" className="w-full">
                    Manage Security Settings
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {renderDialog()}
    </>
  )
}

export default Profile
