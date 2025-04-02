import { motion } from "framer-motion";
import {
  Bell,
  Lock,
  User,
  Monitor,
  Moon,
  Sun,
  Globe,
  Mail,
  Shield,
  Database,
  Save,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  Settings,
  Grid,
  Palette
} from "lucide-react";
import { useState } from "react";

export default function SettingsView() {
  const [theme, setTheme] = useState("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [language, setLanguage] = useState("en");

  // Mock function for saving settings
  const saveSettings = () => {
    // Add actual save functionality
    alert("Settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Settings Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Admin Account</h3>
              <p className="text-blue-100 mt-1">Penguinmans32</p>
            </div>
            <User className="w-8 h-8 text-blue-100" />
          </div>
          <p className="mt-4 text-sm text-blue-100">Last updated: 2025-04-01 14:02:54</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Security Status</h3>
              <p className="text-purple-100 mt-1">Enhanced Protection</p>
            </div>
            <Shield className="w-8 h-8 text-purple-100" />
          </div>
          <p className="mt-4 text-sm text-purple-100">All systems operational</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">System Status</h3>
              <p className="text-green-100 mt-1">Healthy</p>
            </div>
            <Database className="w-8 h-8 text-green-100" />
          </div>
          <p className="mt-4 text-sm text-green-100">All services running</p>
        </motion.div>
      </div>

      {/* Main Settings Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {[
              { icon: User, label: "Profile" },
              { icon: Lock, label: "Security" },
              { icon: Bell, label: "Notifications" },
              { icon: Globe, label: "Preferences" },
              { icon: Palette, label: "Appearance" },
              { icon: Settings, label: "Advanced" },
            ].map((item, index) => (
              <button
                key={item.label}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  index === 0
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Settings */}
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="relative group">
                <img
                  src="https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff&size=128"
                  alt="Profile"
                  className="w-32 h-32 rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Name</label>
                  <input
                    type="text"
                    defaultValue="Penguinmans32"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    defaultValue="admin@example.com"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>

            {/* Theme Settings */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Theme Preferences</h3>
              <div className="grid grid-cols-3 gap-4">
                {["light", "dark", "system"].map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => setTheme(themeOption)}
                    className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${
                      theme === themeOption
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {themeOption === "light" && <Sun className="w-6 h-6 text-amber-500" />}
                    {themeOption === "dark" && <Moon className="w-6 h-6 text-blue-600" />}
                    {themeOption === "system" && <Monitor className="w-6 h-6 text-purple-600" />}
                    <span className="text-sm font-medium capitalize">{themeOption}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Settings */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-700">Push Notifications</p>
                      <p className="text-sm text-gray-500">Receive alerts on your dashboard</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notificationsEnabled ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                        notificationsEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-700">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive email updates</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      emailNotifications ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                        emailNotifications ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-700">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      twoFactorEnabled ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                        twoFactorEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Language Settings */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Language & Region</h3>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
              >
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900">
                  <RefreshCw className="w-5 h-5" />
                  Reset to Default
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700">
                  <Trash2 className="w-5 h-5" />
                  Delete Account
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={saveSettings}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Version", value: "v2.1.0", icon: Grid, status: "success" },
            { label: "Last Backup", value: "2025-04-01", icon: Database, status: "success" },
            { label: "Storage", value: "45% used", icon: Save, status: "warning" },
            { label: "API Status", value: "Operational", icon: Globe, status: "success" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200">
              <div className={`p-2 rounded-lg ${
                item.status === "success" ? "bg-green-100" : "bg-yellow-100"
              }`}>
                <item.icon className={`w-5 h-5 ${
                  item.status === "success" ? "text-green-600" : "text-yellow-600"
                }`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="font-medium text-gray-900">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}