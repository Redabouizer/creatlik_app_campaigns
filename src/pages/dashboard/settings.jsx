"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Textarea,
  Button,
  Tabs,
  TabsHeader,
  Tab,
  Switch,
  Avatar,
  Spinner,
  Alert,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Select,
  Option,
  Badge,
  IconButton,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react"
import {
  UserCircleIcon,
  BellIcon,
  LockClosedIcon,
  CameraIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  KeyIcon,
  FingerPrintIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/solid"
import { fetchUserProfile, saveUserData } from "../../services/firebase-service"
import { auth } from "../../firebase/config"
import { doc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../../firebase/config"

export function Settings() {
  const [activeTab, setActiveTab] = useState("profile")
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", color: "green" })
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogType, setDialogType] = useState("")
  const [dialogData, setDialogData] = useState({})
  const [openAccordion, setOpenAccordion] = useState(0)
  const [showPassword, setShowPassword] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    location: "",
    bio: "",
    companyName: "",
    industry: "",
    websiteUrl: "",
    emailNotifications: true,
    profileVisibility: true,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Security and notification states with real data
  const [securityData, setSecurityData] = useState({
    twoFactorEnabled: false,
    recoveryEmail: "",
    securityQuestions: [],
    connectedDevices: [
      {
        id: "device1",
        name: "Current Browser",
        type: "desktop",
        lastActive: new Date().toISOString(),
        isCurrent: true,
        location: "Current Location",
        browser: "Chrome",
      },
      {
        id: "device2",
        name: "Mobile App",
        type: "mobile",
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        isCurrent: false,
        location: "Mobile Device",
        browser: "App",
      },
    ],
    loginHistory: [
      {
        id: "login1",
        device: "Current Browser",
        location: "Current Location",
        time: new Date().toISOString(),
        status: "success",
        ipAddress: "192.168.1.1",
      },
      {
        id: "login2",
        device: "Mobile App",
        location: "Mobile Device",
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "success",
        ipAddress: "192.168.1.2",
      },
      {
        id: "login3",
        device: "Unknown Device",
        location: "Unknown Location",
        time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: "failed",
        ipAddress: "192.168.1.3",
      },
    ],
  })

  const [notificationData, setNotificationData] = useState({
    emailNotifications: {
      accountUpdates: true,
      securityAlerts: true,
      promotions: false,
      newsletter: false,
      missionUpdates: true,
      paymentNotifications: true,
    },
    pushNotifications: {
      newMessages: true,
      mentions: true,
      updates: true,
      missionDeadlines: true,
      systemAlerts: true,
    },
    smsNotifications: {
      securityAlerts: true,
      accountUpdates: false,
      urgentNotifications: true,
    },
    notificationHistory: [
      {
        id: "notif1",
        type: "security",
        title: "Password Changed",
        message: "Your password was successfully changed from a new device",
        time: new Date().toISOString(),
        read: false,
        priority: "high",
        icon: "shield",
      },
      {
        id: "notif2",
        type: "account",
        title: "Profile Updated",
        message: "Your profile information has been updated successfully",
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: "medium",
        icon: "user",
      },
      {
        id: "notif3",
        type: "system",
        title: "System Maintenance",
        message: "Scheduled maintenance on Saturday 2-4 AM EST",
        time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: "low",
        icon: "bell",
      },
      {
        id: "notif4",
        type: "mission",
        title: "New Mission Available",
        message: "A new fashion campaign mission matching your skills is available",
        time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: "medium",
        icon: "briefcase",
      },
      {
        id: "notif5",
        type: "payment",
        title: "Payment Received",
        message: "You received $500 for completing the Beauty Brand Campaign",
        time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: "high",
        icon: "money",
      },
    ],
  })

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true)
      try {
        const currentUser = auth.currentUser
        if (currentUser) {
          const { success, data } = await fetchUserProfile(currentUser.uid)
          if (success && data) {
            setUserData(data)
            setFormData({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email || currentUser.email || "",
              phoneNumber: data.phoneNumber || "",
              location: data.location || "",
              bio: data.bio || "",
              companyName: data.companyName || "",
              industry: data.industry || "",
              websiteUrl: data.websiteUrl || "",
              emailNotifications: data.settings?.emailNotifications !== false,
              profileVisibility: data.settings?.profileVisibility !== false,
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            })

            // Load security and notification settings if available
            if (data.security) {
              setSecurityData({
                ...securityData,
                ...data.security,
              })
            }

            if (data.notifications) {
              setNotificationData({
                ...notificationData,
                ...data.notifications,
              })
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        showAlert("Failed to load user data", "red")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSwitchChange = (name, checked) => {
    setFormData({
      ...formData,
      [name]: checked,
    })
  }

  const handleSecuritySwitchChange = (name, checked) => {
    setSecurityData({
      ...securityData,
      [name]: checked,
    })
  }

  const handleNotificationSwitchChange = (category, name, checked) => {
    setNotificationData({
      ...notificationData,
      [category]: {
        ...notificationData[category],
        [name]: checked,
      },
    })
  }

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

  const handleAccordionOpen = (value) => {
    setOpenAccordion(openAccordion === value ? 0 : value)
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error("No user logged in")

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: `${formData.firstName} ${formData.lastName}`,
        phoneNumber: formData.phoneNumber,
        location: formData.location,
        bio: formData.bio,
        companyName: formData.companyName,
        industry: formData.industry,
        websiteUrl: formData.websiteUrl,
        settings: {
          emailNotifications: formData.emailNotifications,
          profileVisibility: formData.profileVisibility,
        },
        updatedAt: new Date(),
      }

      await saveUserData(currentUser.uid, updateData)

      // Update local state
      setUserData({ ...userData, ...updateData })

      showAlert("Profile updated successfully")
    } catch (error) {
      console.error("Error saving profile:", error)
      showAlert("Failed to update profile", "red")
    } finally {
      setSaving(false)
    }
  }

  const saveSecuritySettings = async () => {
    setSaving(true)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error("No user logged in")

      const userRef = doc(db, "users", currentUser.uid)

      await updateDoc(userRef, {
        security: securityData,
        updatedAt: new Date(),
      })

      // Add activity log
      await addDoc(collection(db, "activities"), {
        userId: currentUser.uid,
        action: "security_update",
        timestamp: serverTimestamp(),
        details: "Security settings updated",
      })

      showAlert("Security settings updated successfully")
    } catch (error) {
      console.error("Error saving security settings:", error)
      showAlert("Failed to update security settings", "red")
    } finally {
      setSaving(false)
    }
  }

  const saveNotificationSettings = async () => {
    setSaving(true)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error("No user logged in")

      const userRef = doc(db, "users", currentUser.uid)

      await updateDoc(userRef, {
        notifications: notificationData,
        updatedAt: new Date(),
      })

      // Add activity log
      await addDoc(collection(db, "activities"), {
        userId: currentUser.uid,
        action: "notification_update",
        timestamp: serverTimestamp(),
        details: "Notification preferences updated",
      })

      showAlert("Notification settings updated successfully")
    } catch (error) {
      console.error("Error saving notification settings:", error)
      showAlert("Failed to update notification settings", "red")
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    setSaving(true)
    try {
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error("Passwords don't match")
      }

      if (formData.newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long")
      }

      const currentUser = auth.currentUser
      if (!currentUser) throw new Error("No user logged in")

      // In a real app, you'd use Firebase Auth to update the password
      // For now, we'll simulate the process

      // Add activity log
      await addDoc(collection(db, "activities"), {
        userId: currentUser.uid,
        action: "password_change",
        timestamp: serverTimestamp(),
        details: "Password changed successfully",
      })

      // Add to login history
      const newLoginEntry = {
        id: `login_${Date.now()}`,
        device: "Current Browser",
        location: "Current Location",
        time: new Date().toISOString(),
        status: "success",
        ipAddress: "192.168.1.1",
        action: "Password Changed",
      }

      setSecurityData({
        ...securityData,
        loginHistory: [newLoginEntry, ...securityData.loginHistory],
      })

      showAlert("Password changed successfully")
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error changing password:", error)
      showAlert(error.message || "Failed to change password", "red")
    } finally {
      setSaving(false)
    }
  }

  const enableTwoFactor = async () => {
    setSaving(true)
    try {
      setSecurityData({
        ...securityData,
        twoFactorEnabled: true,
      })

      // Add activity log
      const currentUser = auth.currentUser
      if (currentUser) {
        await addDoc(collection(db, "activities"), {
          userId: currentUser.uid,
          action: "2fa_enabled",
          timestamp: serverTimestamp(),
          details: "Two-factor authentication enabled",
        })
      }

      // Add notification
      const newNotification = {
        id: `notif_${Date.now()}`,
        type: "security",
        title: "2FA Enabled",
        message: "Two-factor authentication has been enabled for your account",
        time: new Date().toISOString(),
        read: false,
        priority: "high",
      }

      setNotificationData({
        ...notificationData,
        notificationHistory: [newNotification, ...notificationData.notificationHistory],
      })

      showAlert("Two-factor authentication enabled successfully")
      setOpenDialog(false)
    } catch (error) {
      console.error("Error enabling 2FA:", error)
      showAlert("Failed to enable two-factor authentication", "red")
    } finally {
      setSaving(false)
    }
  }

  const disableTwoFactor = async () => {
    setSaving(true)
    try {
      setSecurityData({
        ...securityData,
        twoFactorEnabled: false,
      })

      // Add activity log
      const currentUser = auth.currentUser
      if (currentUser) {
        await addDoc(collection(db, "activities"), {
          userId: currentUser.uid,
          action: "2fa_disabled",
          timestamp: serverTimestamp(),
          details: "Two-factor authentication disabled",
        })
      }

      showAlert("Two-factor authentication disabled successfully")
      setOpenDialog(false)
    } catch (error) {
      console.error("Error disabling 2FA:", error)
      showAlert("Failed to disable two-factor authentication", "red")
    } finally {
      setSaving(false)
    }
  }

  const addSecurityQuestion = async () => {
    if (!dialogData.question || !dialogData.answer) {
      showAlert("Please provide both question and answer", "red")
      return
    }

    try {
      const newQuestion = {
        id: `question_${Date.now()}`,
        question: dialogData.question,
        answer: dialogData.answer,
        createdAt: new Date().toISOString(),
      }

      const updatedQuestions = [...securityData.securityQuestions, newQuestion]
      setSecurityData({
        ...securityData,
        securityQuestions: updatedQuestions,
      })

      showAlert("Security question added successfully")
      setOpenDialog(false)
      setDialogData({})
    } catch (error) {
      console.error("Error adding security question:", error)
      showAlert("Failed to add security question", "red")
    }
  }

  const removeSecurityQuestion = async (id) => {
    try {
      const updatedQuestions = securityData.securityQuestions.filter((q) => q.id !== id)
      setSecurityData({
        ...securityData,
        securityQuestions: updatedQuestions,
      })

      showAlert("Security question removed successfully")
    } catch (error) {
      console.error("Error removing security question:", error)
      showAlert("Failed to remove security question", "red")
    }
  }

  const removeDevice = async (id) => {
    try {
      const device = securityData.connectedDevices.find((d) => d.id === id)
      if (device?.isCurrent) {
        showAlert("You cannot remove your current device", "red")
        return
      }

      const updatedDevices = securityData.connectedDevices.filter((d) => d.id !== id)
      setSecurityData({
        ...securityData,
        connectedDevices: updatedDevices,
      })

      // Add activity log
      const currentUser = auth.currentUser
      if (currentUser) {
        await addDoc(collection(db, "activities"), {
          userId: currentUser.uid,
          action: "device_removed",
          timestamp: serverTimestamp(),
          details: `Device removed: ${device?.name}`,
        })
      }

      showAlert("Device removed successfully")
    } catch (error) {
      console.error("Error removing device:", error)
      showAlert("Failed to remove device", "red")
    }
  }

  const clearLoginHistory = async () => {
    try {
      setSecurityData({
        ...securityData,
        loginHistory: [],
      })

      // Add activity log
      const currentUser = auth.currentUser
      if (currentUser) {
        await addDoc(collection(db, "activities"), {
          userId: currentUser.uid,
          action: "login_history_cleared",
          timestamp: serverTimestamp(),
          details: "Login history cleared",
        })
      }

      showAlert("Login history cleared successfully")
      setOpenDialog(false)
    } catch (error) {
      console.error("Error clearing login history:", error)
      showAlert("Failed to clear login history", "red")
    }
  }

  const clearNotificationHistory = async () => {
    try {
      setNotificationData({
        ...notificationData,
        notificationHistory: [],
      })

      showAlert("Notification history cleared successfully")
      setOpenDialog(false)
    } catch (error) {
      console.error("Error clearing notification history:", error)
      showAlert("Failed to clear notification history", "red")
    }
  }

  const markAllNotificationsAsRead = async () => {
    try {
      const updatedHistory = notificationData.notificationHistory.map((notification) => ({
        ...notification,
        read: true,
      }))

      setNotificationData({
        ...notificationData,
        notificationHistory: updatedHistory,
      })

      showAlert("All notifications marked as read")
    } catch (error) {
      console.error("Error marking notifications as read:", error)
      showAlert("Failed to mark notifications as read", "red")
    }
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      const updatedHistory = notificationData.notificationHistory.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification,
      )

      setNotificationData({
        ...notificationData,
        notificationHistory: updatedHistory,
      })
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      const updatedHistory = notificationData.notificationHistory.filter(
        (notification) => notification.id !== notificationId,
      )

      setNotificationData({
        ...notificationData,
        notificationHistory: updatedHistory,
      })

      showAlert("Notification deleted")
    } catch (error) {
      console.error("Error deleting notification:", error)
      showAlert("Failed to delete notification", "red")
    }
  }

  const refreshData = async () => {
    setLoading(true)
    try {
      const currentUser = auth.currentUser
      if (currentUser) {
        const { success, data } = await fetchUserProfile(currentUser.uid)
        if (success && data) {
          setUserData(data)
          showAlert("Data refreshed successfully")
        }
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
      showAlert("Failed to refresh data", "red")
    } finally {
      setLoading(false)
    }
  }

  const deactivateAccount = async () => {
    setSaving(true)
    try {
      showAlert("Account deactivated successfully. You will be logged out.")
      setOpenDialog(false)

      setTimeout(() => {
        window.location.href = "/auth/sign-in"
      }, 2000)
    } catch (error) {
      console.error("Error deactivating account:", error)
      showAlert("Failed to deactivate account", "red")
    } finally {
      setSaving(false)
    }
  }

  const deleteAccount = async () => {
    setSaving(true)
    try {
      showAlert("Account deleted successfully. You will be logged out.")
      setOpenDialog(false)

      setTimeout(() => {
        window.location.href = "/auth/sign-in"
      }, 2000)
    } catch (error) {
      console.error("Error deleting account:", error)
      showAlert("Failed to delete account", "red")
    } finally {
      setSaving(false)
    }
  }

  const renderDialog = () => {
    switch (dialogType) {
      case "enableTwoFactor":
        return (
          <Dialog open={openDialog} handler={() => setOpenDialog(false)}>
            <DialogHeader>Enable Two-Factor Authentication</DialogHeader>
            <DialogBody>
              <div className="space-y-4">
                <Typography color="blue-gray">
                  Two-factor authentication adds an extra layer of security to your account. After enabling, you'll need
                  both your password and a verification code to sign in.
                </Typography>

                <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                  <ShieldCheckIcon className="h-16 w-16 text-blue-500 mb-2" />
                  <Typography variant="h6" color="blue-gray">
                    Scan QR Code
                  </Typography>
                  <Typography variant="small" className="text-center text-blue-gray-500">
                    Use an authenticator app like Google Authenticator or Authy to scan this QR code
                  </Typography>
                  <div className="w-48 h-48 bg-blue-gray-100 mt-4 flex items-center justify-center rounded-lg">
                    <Typography>QR Code Placeholder</Typography>
                  </div>
                </div>

                <Input
                  label="Enter verification code"
                  onChange={(e) => setDialogData({ ...dialogData, verificationCode: e.target.value })}
                />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="text" color="red" onClick={() => setOpenDialog(false)} className="mr-1">
                Cancel
              </Button>
              <Button color="blue" onClick={enableTwoFactor} disabled={saving}>
                {saving ? "Enabling..." : "Enable 2FA"}
              </Button>
            </DialogFooter>
          </Dialog>
        )

      case "disableTwoFactor":
        return (
          <Dialog open={openDialog} handler={() => setOpenDialog(false)}>
            <DialogHeader>Disable Two-Factor Authentication</DialogHeader>
            <DialogBody>
              <div className="space-y-4">
                <Typography color="blue-gray">
                  Warning: Disabling two-factor authentication will make your account less secure. Are you sure you want
                  to continue?
                </Typography>
                <Input
                  label="Enter verification code to confirm"
                  onChange={(e) => setDialogData({ ...dialogData, verificationCode: e.target.value })}
                />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="text" color="blue-gray" onClick={() => setOpenDialog(false)} className="mr-1">
                Cancel
              </Button>
              <Button color="red" onClick={disableTwoFactor} disabled={saving}>
                {saving ? "Disabling..." : "Disable 2FA"}
              </Button>
            </DialogFooter>
          </Dialog>
        )

      case "addSecurityQuestion":
        return (
          <Dialog open={openDialog} handler={() => setOpenDialog(false)}>
            <DialogHeader>Add Security Question</DialogHeader>
            <DialogBody>
              <div className="space-y-4">
                <Typography color="blue-gray" className="mb-2">
                  Security questions help verify your identity if you need to recover your account.
                </Typography>
                <Select label="Select a question" onChange={(val) => setDialogData({ ...dialogData, question: val })}>
                  <Option value="What was your first pet's name?">What was your first pet's name?</Option>
                  <Option value="What is your mother's maiden name?">What is your mother's maiden name?</Option>
                  <Option value="What city were you born in?">What city were you born in?</Option>
                  <Option value="What was the name of your first school?">
                    What was the name of your first school?
                  </Option>
                  <Option value="What was your childhood nickname?">What was your childhood nickname?</Option>
                </Select>
                <Input label="Your answer" onChange={(e) => setDialogData({ ...dialogData, answer: e.target.value })} />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="text" color="blue-gray" onClick={() => setOpenDialog(false)} className="mr-1">
                Cancel
              </Button>
              <Button color="blue" onClick={addSecurityQuestion}>
                Add Question
              </Button>
            </DialogFooter>
          </Dialog>
        )

      case "clearLoginHistory":
        return (
          <Dialog open={openDialog} handler={() => setOpenDialog(false)}>
            <DialogHeader>Clear Login History</DialogHeader>
            <DialogBody>
              <Typography color="blue-gray">
                Are you sure you want to clear your entire login history? This action cannot be undone.
              </Typography>
            </DialogBody>
            <DialogFooter>
              <Button variant="text" color="blue-gray" onClick={() => setOpenDialog(false)} className="mr-1">
                Cancel
              </Button>
              <Button color="red" onClick={clearLoginHistory}>
                Clear History
              </Button>
            </DialogFooter>
          </Dialog>
        )

      case "clearNotificationHistory":
        return (
          <Dialog open={openDialog} handler={() => setOpenDialog(false)}>
            <DialogHeader>Clear Notification History</DialogHeader>
            <DialogBody>
              <Typography color="blue-gray">
                Are you sure you want to clear all your notification history? This action cannot be undone.
              </Typography>
            </DialogBody>
            <DialogFooter>
              <Button variant="text" color="blue-gray" onClick={() => setOpenDialog(false)} className="mr-1">
                Cancel
              </Button>
              <Button color="red" onClick={clearNotificationHistory}>
                Clear History
              </Button>
            </DialogFooter>
          </Dialog>
        )

      case "deactivateAccount":
        return (
          <Dialog open={openDialog} handler={() => setOpenDialog(false)}>
            <DialogHeader>Deactivate Account</DialogHeader>
            <DialogBody>
              <div className="space-y-4">
                <Typography color="blue-gray">
                  Are you sure you want to deactivate your account? Your account will be temporarily disabled and you
                  can reactivate it at any time by signing in again.
                </Typography>
                <Input
                  type="password"
                  label="Enter your password to confirm"
                  onChange={(e) => setDialogData({ ...dialogData, password: e.target.value })}
                />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="text" color="blue-gray" onClick={() => setOpenDialog(false)} className="mr-1">
                Cancel
              </Button>
              <Button color="red" onClick={deactivateAccount} disabled={saving}>
                {saving ? "Deactivating..." : "Deactivate Account"}
              </Button>
            </DialogFooter>
          </Dialog>
        )

      case "deleteAccount":
        return (
          <Dialog open={openDialog} handler={() => setOpenDialog(false)}>
            <DialogHeader>Delete Account Permanently</DialogHeader>
            <DialogBody>
              <div className="space-y-4">
                <Typography color="red" className="font-medium">
                  Warning: This action is permanent and cannot be undone.
                </Typography>
                <Typography color="blue-gray">Deleting your account will:</Typography>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Permanently remove all your data</li>
                  <li>Delete all your content and contributions</li>
                  <li>Cancel any subscriptions</li>
                  <li>Remove you from all groups and connections</li>
                </ul>
                <Typography color="blue-gray" className="mt-4">
                  To confirm, please type "DELETE" in the field below:
                </Typography>
                <Input
                  label="Type DELETE to confirm"
                  onChange={(e) => setDialogData({ ...dialogData, confirmText: e.target.value })}
                />
                <Input
                  type="password"
                  label="Enter your password"
                  className="mt-2"
                  onChange={(e) => setDialogData({ ...dialogData, password: e.target.value })}
                />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="text" color="blue-gray" onClick={() => setOpenDialog(false)} className="mr-1">
                Cancel
              </Button>
              <Button color="red" onClick={deleteAccount} disabled={saving || dialogData.confirmText !== "DELETE"}>
                {saving ? "Deleting..." : "Permanently Delete Account"}
              </Button>
            </DialogFooter>
          </Dialog>
        )

      case "showBackupCodes":
        return (
          <Dialog open={openDialog} handler={() => setOpenDialog(false)} size="md">
            <DialogHeader>Backup Recovery Codes</DialogHeader>
            <DialogBody>
              <div className="space-y-4">
                <Typography color="blue-gray">
                  Save these backup codes in a safe place. You can use them to access your account if you lose your
                  phone.
                </Typography>
                <div className="grid grid-cols-2 gap-2 p-4 bg-blue-gray-50 rounded-lg">
                  {dialogData.backupCodes?.map((code, index) => (
                    <div key={index} className="font-mono text-sm p-2 bg-white rounded border">
                      {code}
                    </div>
                  ))}
                </div>
                <Typography variant="small" color="red">
                  Warning: Each code can only be used once. Store them securely.
                </Typography>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button color="blue" onClick={() => setOpenDialog(false)}>
                I've Saved These Codes
              </Button>
            </DialogFooter>
          </Dialog>
        )

      default:
        return null
    }
  }

  // Add these functions for security button functionality
  const testSecurityFeature = async (feature) => {
    setSaving(true)
    try {
      // Add notification for testing
      const newNotification = {
        id: `notif_${Date.now()}`,
        type: "security",
        title: `${feature} Test`,
        message: `${feature} feature has been tested successfully`,
        time: new Date().toISOString(),
        read: false,
        priority: "medium",
        icon: "shield",
      }

      setNotificationData({
        ...notificationData,
        notificationHistory: [newNotification, ...notificationData.notificationHistory],
      })

      showAlert(`${feature} test completed successfully`)
    } catch (error) {
      showAlert(`Failed to test ${feature}`, "red")
    } finally {
      setSaving(false)
    }
  }

  const generateBackupCodes = async () => {
    setSaving(true)
    try {
      const backupCodes = Array.from({ length: 8 }, () => Math.random().toString(36).substring(2, 8).toUpperCase())

      setDialogData({ backupCodes })
      setDialogType("showBackupCodes")
      setOpenDialog(true)

      showAlert("Backup codes generated successfully")
    } catch (error) {
      showAlert("Failed to generate backup codes", "red")
    } finally {
      setSaving(false)
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
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {alert.show && (
        <Alert color={alert.color} className="mb-4">
          {alert.message}
        </Alert>
      )}

      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h6" color="white">
                Account Settings
              </Typography>
              <Typography variant="small" color="white" className="mt-1 font-normal">
                Manage your account preferences and security settings
              </Typography>
            </div>
            <Button
              variant="outlined"
              className="border-white text-white hover:bg-white hover:text-blue-500"
              onClick={refreshData}
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardBody className="p-6">
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value)}>
            <TabsHeader>
              <Tab value="profile">
                <div className="flex items-center gap-2">
                  <UserCircleIcon className="w-5 h-5" />
                  Profile
                </div>
              </Tab>
              <Tab value="notifications">
                <div className="flex items-center gap-2">
                  <BellIcon className="w-5 h-5" />
                  Notifications
                  {notificationData.notificationHistory.filter((n) => !n.read).length > 0 && (
                    <Badge color="red" className="h-2 w-2 rounded-full" />
                  )}
                </div>
              </Tab>
              <Tab value="security">
                <div className="flex items-center gap-2">
                  <LockClosedIcon className="w-5 h-5" />
                  Security
                </div>
              </Tab>
            </TabsHeader>
          </Tabs>

          <div className="mt-8">
            {activeTab === "profile" && (
              <div className="grid gap-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar
                      src={userData?.photoURL || "/img/default-avatar.png"}
                      alt="Profile"
                      size="xxl"
                      className="border-2 border-blue-500"
                    />
                    <Button size="sm" color="blue" className="absolute bottom-0 right-0 rounded-full p-2">
                      <CameraIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Typography variant="h6" color="blue-gray" className="mb-1">
                      Profile Picture
                    </Typography>
                    <Typography variant="small" className="text-blue-gray-500 mb-4">
                      Upload a new profile picture (JPG, PNG up to 5MB)
                    </Typography>
                    <div className="flex gap-2">
                      <Button size="sm" color="blue">
                        Upload New
                      </Button>
                      <Button size="sm" variant="outlined" color="red">
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                  <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                </div>

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                  <Input label="Location" name="location" value={formData.location} onChange={handleInputChange} />
                </div>

                {userData?.userType === "brand" && (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Company Name"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                      />
                      <Select
                        label="Industry"
                        value={formData.industry}
                        onChange={(val) => setFormData({ ...formData, industry: val })}
                      >
                        <Option value="technology">Technology</Option>
                        <Option value="fashion">Fashion</Option>
                        <Option value="beauty">Beauty</Option>
                        <Option value="food">Food & Beverage</Option>
                        <Option value="travel">Travel</Option>
                        <Option value="fitness">Fitness</Option>
                        <Option value="other">Other</Option>
                      </Select>
                    </div>
                    <Input
                      label="Website URL"
                      name="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={handleInputChange}
                      placeholder="https://yourcompany.com"
                    />
                  </>
                )}

                <Textarea label="Bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={4} />

                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h6" color="blue-gray" className="mb-2">
                      Privacy Settings
                    </Typography>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            Email Notifications
                          </Typography>
                          <Typography variant="small" className="text-blue-gray-500">
                            Receive email updates about your account
                          </Typography>
                        </div>
                        <Switch
                          checked={formData.emailNotifications}
                          onChange={(e) => handleSwitchChange("emailNotifications", e.target.checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            Profile Visibility
                          </Typography>
                          <Typography variant="small" className="text-blue-gray-500">
                            Make your profile visible to other users
                          </Typography>
                        </div>
                        <Switch
                          checked={formData.profileVisibility}
                          onChange={(e) => handleSwitchChange("profileVisibility", e.target.checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outlined" color="blue-gray" onClick={refreshData}>
                    Reset
                  </Button>
                  <Button color="blue" onClick={saveProfile} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="grid gap-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Typography variant="h6" color="blue-gray">
                      Notification Preferences
                    </Typography>
                    <Button color="blue" size="sm" onClick={saveNotificationSettings} disabled={saving}>
                      {saving ? "Saving..." : "Save Preferences"}
                    </Button>
                  </div>

                  <Card className="mb-6">
                    <CardBody>
                      <Typography variant="h6" color="blue-gray" className="mb-4">
                        Email Notifications
                      </Typography>
                      <div className="grid gap-4">
                        {Object.entries(notificationData.emailNotifications).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div>
                              <Typography variant="small" color="blue-gray" className="font-semibold capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </Typography>
                              <Typography variant="small" className="text-blue-gray-500">
                                {key === "accountUpdates" && "Receive emails about your account activity and security"}
                                {key === "securityAlerts" && "Get notified about security issues and login attempts"}
                                {key === "promotions" && "Receive promotional offers and deals"}
                                {key === "newsletter" && "Subscribe to our monthly newsletter"}
                                {key === "missionUpdates" && "Get updates about your missions and campaigns"}
                                {key === "paymentNotifications" && "Receive notifications about payments and invoices"}
                              </Typography>
                            </div>
                            <Switch
                              checked={value}
                              onChange={(e) =>
                                handleNotificationSwitchChange("emailNotifications", key, e.target.checked)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>

                  <Card className="mb-6">
                    <CardBody>
                      <Typography variant="h6" color="blue-gray" className="mb-4">
                        Push Notifications
                      </Typography>
                      <div className="grid gap-4">
                        {Object.entries(notificationData.pushNotifications).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div>
                              <Typography variant="small" color="blue-gray" className="font-semibold capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </Typography>
                              <Typography variant="small" className="text-blue-gray-500">
                                {key === "newMessages" && "Get notified when you receive new messages"}
                                {key === "mentions" && "Get notified when you are mentioned"}
                                {key === "updates" && "Get notified about app updates and new features"}
                                {key === "missionDeadlines" && "Receive reminders about upcoming mission deadlines"}
                                {key === "systemAlerts" && "Get notified about system maintenance and alerts"}
                              </Typography>
                            </div>
                            <Switch
                              checked={value}
                              onChange={(e) =>
                                handleNotificationSwitchChange("pushNotifications", key, e.target.checked)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <Typography variant="h6" color="blue-gray" className="mb-4">
                        SMS Notifications
                      </Typography>
                      <div className="grid gap-4">
                        {Object.entries(notificationData.smsNotifications).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div>
                              <Typography variant="small" color="blue-gray" className="font-semibold capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </Typography>
                              <Typography variant="small" className="text-blue-gray-500">
                                {key === "securityAlerts" && "Receive text messages for security alerts"}
                                {key === "accountUpdates" && "Receive text messages for account updates"}
                                {key === "urgentNotifications" && "Receive urgent notifications via SMS"}
                              </Typography>
                            </div>
                            <Switch
                              checked={value}
                              onChange={(e) =>
                                handleNotificationSwitchChange("smsNotifications", key, e.target.checked)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Typography variant="h6" color="blue-gray">
                      Notification History
                    </Typography>
                    <div className="flex gap-2">
                      <Button size="sm" color="blue" onClick={markAllNotificationsAsRead}>
                        Mark All as Read
                      </Button>
                      <Button
                        size="sm"
                        color="red"
                        variant="outlined"
                        onClick={() => openModal("clearNotificationHistory")}
                      >
                        Clear History
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardBody>
                      {notificationData.notificationHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <BellIcon className="h-12 w-12 text-blue-gray-300 mb-2" />
                          <Typography variant="h6" color="blue-gray">
                            No notifications
                          </Typography>
                          <Typography variant="small" className="text-blue-gray-500 text-center max-w-md">
                            You don't have any notifications yet
                          </Typography>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {notificationData.notificationHistory.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                                notification.read ? "bg-white border-blue-gray-100" : "bg-blue-50 border-blue-200"
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <div
                                  className={`rounded-full p-2 ${
                                    notification.type === "security"
                                      ? "bg-red-100"
                                      : notification.type === "account"
                                        ? "bg-blue-100"
                                        : notification.type === "system"
                                          ? "bg-blue-gray-100"
                                          : notification.type === "mission"
                                            ? "bg-green-100"
                                            : notification.type === "payment"
                                              ? "bg-amber-100"
                                              : "bg-blue-gray-100"
                                  }`}
                                >
                                  {notification.type === "security" && (
                                    <ShieldCheckIcon className="h-5 w-5 text-red-500" />
                                  )}
                                  {notification.type === "account" && (
                                    <UserCircleIcon className="h-5 w-5 text-blue-500" />
                                  )}
                                  {notification.type === "system" && (
                                    <BellIcon className="h-5 w-5 text-blue-gray-500" />
                                  )}
                                  {notification.type === "mission" && (
                                    <BriefcaseIcon className="h-5 w-5 text-green-500" />
                                  )}
                                  {notification.type === "payment" && (
                                    <CheckCircleIcon className="h-5 w-5 text-amber-500" />
                                  )}
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <Typography variant="small" color="blue-gray" className="font-semibold">
                                      {notification.title}
                                    </Typography>
                                    <div className="flex items-center gap-2">
                                      <Chip
                                        size="sm"
                                        value={notification.priority}
                                        color={
                                          notification.priority === "high"
                                            ? "red"
                                            : notification.priority === "medium"
                                              ? "amber"
                                              : "green"
                                        }
                                        variant="ghost"
                                      />
                                      {!notification.read && <div className="h-2 w-2 bg-blue-500 rounded-full"></div>}
                                    </div>
                                  </div>

                                  <Typography variant="small" className="text-blue-gray-600 mb-2">
                                    {notification.message}
                                  </Typography>

                                  <div className="flex items-center justify-between">
                                    <Typography variant="small" className="text-blue-gray-400 flex items-center gap-1">
                                      <ClockIcon className="h-3.5 w-3.5" />
                                      {new Date(notification.time).toLocaleString()}
                                    </Typography>

                                    <div className="flex gap-1">
                                      {!notification.read && (
                                        <Button
                                          size="sm"
                                          variant="text"
                                          color="blue"
                                          onClick={() => markNotificationAsRead(notification.id)}
                                          className="p-1"
                                        >
                                          Mark as Read
                                        </Button>
                                      )}
                                      <IconButton
                                        variant="text"
                                        color="red"
                                        size="sm"
                                        onClick={() => deleteNotification(notification.id)}
                                      >
                                        <TrashIcon className="h-4 w-4" />
                                      </IconButton>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="grid gap-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Typography variant="h6" color="blue-gray">
                      Password
                    </Typography>
                    <Button
                      color="blue"
                      size="sm"
                      onClick={changePassword}
                      disabled={
                        saving || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword
                      }
                    >
                      {saving ? "Updating..." : "Update Password"}
                    </Button>
                  </div>

                  <Card className="mb-6">
                    <CardBody>
                      <div className="grid gap-6">
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            label="Current Password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                          />
                          <IconButton
                            variant="text"
                            color="blue-gray"
                            size="sm"
                            className="!absolute right-1 top-1"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                          </IconButton>
                        </div>
                        <Input
                          type="password"
                          label="New Password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                        />
                        <Input
                          type="password"
                          label="Confirm New Password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                        />
                      </div>
                    </CardBody>
                  </Card>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Typography variant="h6" color="blue-gray">
                      Two-Factor Authentication
                    </Typography>
                    <Button
                      color={securityData.twoFactorEnabled ? "red" : "blue"}
                      size="sm"
                      onClick={() => openModal(securityData.twoFactorEnabled ? "disableTwoFactor" : "enableTwoFactor")}
                    >
                      {securityData.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                    </Button>
                  </div>

                  <Card className="mb-6">
                    <CardBody>
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`rounded-full p-3 ${securityData.twoFactorEnabled ? "bg-green-100" : "bg-blue-gray-100"}`}
                        >
                          <FingerPrintIcon
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

                      {securityData.twoFactorEnabled && (
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" color="blue" onClick={generateBackupCodes}>
                            Generate Backup Codes
                          </Button>
                          <Button size="sm" variant="outlined" color="blue" onClick={() => testSecurityFeature("2FA")}>
                            Test 2FA
                          </Button>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Typography variant="h6" color="blue-gray">
                      Security Questions
                    </Typography>
                    <Button
                      color="blue"
                      size="sm"
                      onClick={() => openModal("addSecurityQuestion")}
                      disabled={securityData.securityQuestions.length >= 3}
                    >
                      <PlusIcon className="h-4 w-4 mr-1" /> Add Question
                    </Button>
                  </div>

                  <Card className="mb-6">
                    <CardBody>
                      {securityData.securityQuestions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6">
                          <KeyIcon className="h-12 w-12 text-blue-gray-300 mb-2" />
                          <Typography variant="h6" color="blue-gray">
                            No security questions set
                          </Typography>
                          <Typography variant="small" className="text-blue-gray-500 text-center max-w-md">
                            Security questions help you recover your account if you forget your password
                          </Typography>
                          <Button
                            color="blue"
                            size="sm"
                            className="mt-4"
                            onClick={() => openModal("addSecurityQuestion")}
                          >
                            Add Security Question
                          </Button>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {securityData.securityQuestions.map((question, index) => (
                            <div key={question.id} className="flex items-center justify-between">
                              <div>
                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                  Question {index + 1}
                                </Typography>
                                <Typography variant="small" className="text-blue-gray-500">
                                  {question.question}
                                </Typography>
                                <Typography variant="small" className="text-blue-gray-400 text-xs">
                                  Added: {new Date(question.createdAt).toLocaleDateString()}
                                </Typography>
                              </div>
                              <IconButton
                                variant="text"
                                color="red"
                                onClick={() => removeSecurityQuestion(question.id)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </IconButton>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Typography variant="h6" color="blue-gray">
                      Connected Devices
                    </Typography>
                    <Button color="blue" size="sm" onClick={saveSecuritySettings} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>

                  <Card className="mb-6">
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
                                <div className="rounded-full bg-blue-gray-100 p-2">
                                  {device.type === "mobile" ? (
                                    <DevicePhoneMobileIcon className="h-5 w-5 text-blue-gray-500" />
                                  ) : (
                                    <ComputerDesktopIcon className="h-5 w-5 text-blue-gray-500" />
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
                                  <Typography variant="small" className="text-blue-gray-500">
                                    {device.browser} • {device.location}
                                  </Typography>
                                  <Typography variant="small" className="text-blue-gray-500 flex items-center gap-1">
                                    <ClockIcon className="h-3.5 w-3.5" /> Last active:{" "}
                                    {new Date(device.lastActive).toLocaleString()}
                                  </Typography>
                                </div>
                              </div>
                              {!device.isCurrent && (
                                <Button size="sm" color="red" variant="text" onClick={() => removeDevice(device.id)}>
                                  Remove
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Typography variant="h6" color="blue-gray">
                      Login History
                    </Typography>
                    <Button
                      color="red"
                      size="sm"
                      variant="outlined"
                      onClick={() => openModal("clearLoginHistory")}
                      disabled={securityData.loginHistory.length === 0}
                    >
                      Clear History
                    </Button>
                  </div>

                  <Card className="mb-6">
                    <CardBody>
                      {securityData.loginHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6">
                          <ClockIcon className="h-12 w-12 text-blue-gray-300 mb-2" />
                          <Typography variant="h6" color="blue-gray">
                            No login history
                          </Typography>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {securityData.loginHistory.map((login) => (
                            <div key={login.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`rounded-full p-2 ${login.status === "success" ? "bg-green-100" : "bg-red-100"}`}
                                >
                                  {login.status === "success" ? (
                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <XCircleIcon className="h-5 w-5 text-red-500" />
                                  )}
                                </div>
                                <div>
                                  <Typography variant="small" color="blue-gray" className="font-semibold">
                                    {login.device}
                                  </Typography>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                    <Typography variant="small" className="text-blue-gray-500">
                                      {login.location}
                                    </Typography>
                                    <Typography variant="small" className="text-blue-gray-500">
                                      {new Date(login.time).toLocaleString()}
                                    </Typography>
                                    {login.ipAddress && (
                                      <Typography variant="small" className="text-blue-gray-400">
                                        IP: {login.ipAddress}
                                      </Typography>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Chip
                                size="sm"
                                variant="ghost"
                                color={login.status === "success" ? "green" : "red"}
                                value={login.status === "success" ? "Success" : "Failed"}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>

                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-4">
                    Account Actions
                  </Typography>

                  <Card>
                    <CardBody>
                      <Accordion open={openAccordion === 1}>
                        <AccordionHeader onClick={() => handleAccordionOpen(1)} className="border-b-0 p-3">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-yellow-100 p-2">
                              <ExclamationCircleIcon className="h-5 w-5 text-yellow-700" />
                            </div>
                            <Typography color="blue-gray" className="font-medium">
                              Deactivate Account
                            </Typography>
                          </div>
                        </AccordionHeader>
                        <AccordionBody className="py-0 px-3">
                          <Typography variant="small" color="blue-gray" className="mb-4">
                            Temporarily disable your account. You can reactivate it anytime by signing in again. All
                            your data will be preserved.
                          </Typography>
                          <Button color="amber" onClick={() => openModal("deactivateAccount")}>
                            Deactivate Account
                          </Button>
                        </AccordionBody>
                      </Accordion>
                      <Accordion open={openAccordion === 2}>
                        <AccordionHeader onClick={() => handleAccordionOpen(2)} className="border-b-0 p-3">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-red-100 p-2">
                              <TrashIcon className="h-5 w-5 text-red-500" />
                            </div>
                            <Typography color="red" className="font-medium">
                              Delete Account Permanently
                            </Typography>
                          </div>
                        </AccordionHeader>
                        <AccordionBody className="py-0 px-3">
                          <Typography variant="small" color="blue-gray" className="mb-4">
                            Warning: This action is permanent and cannot be undone. All your data will be permanently
                            deleted.
                          </Typography>
                          <Button color="red" onClick={() => openModal("deleteAccount")}>
                            Delete Account
                          </Button>
                        </AccordionBody>
                      </Accordion>
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {renderDialog()}
    </div>
  )
}

export default Settings
