import { motion } from "framer-motion";
import {
  User,
  Database,
  Code2,
  Globe,
  Server,
  Cpu,
  Coffee,
  Box,
  Code
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../backendApi/AuthContext";

export default function SettingsView() {
  const [adminInfo, setAdminInfo] = useState({
    username: "Penguinmans32",
    role: "ROLE_ADMIN",
    lastLogin: "2025-04-03 02:10:00",
    email: "admin@example.com"
  });

  const { user } = useAuth();
 
  const techStack = [
    {
      name: "Frontend",
      items: [
        { name: "Vite", icon: Box, color: "purple", version: "5.0.0" },
        { name: "React", icon: Code, color: "blue", version: "18.2.0" },
        { name: "Tailwind CSS", icon: Code2, color: "cyan", version: "3.3.0" }
      ]
    },
    {
      name: "Backend",
      items: [
        { name: "Spring Boot", icon: Coffee, color: "green", version: "3.2.0" },
        { name: "MySQL", icon: Database, color: "orange", version: "8.0" },
        { name: "Java", icon: Cpu, color: "red", version: "17 LTS" }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Admin Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <User className="w-8 h-8" />
              </div>
              <div>
              <h2 className="text-2xl font-bold">
                {user.username.charAt(0).toUpperCase() + user.username.slice(1)}
              </h2>
                <p className="text-indigo-100">{user.role}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <p className="text-indigo-200 text-sm">Last Login (UTC)</p>
                <p className="font-medium">{adminInfo.lastLogin}</p>
              </div>
              <div className="space-y-1">
                <p className="text-indigo-200 text-sm">Email Address</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-green-500/20 text-green-100 rounded-full text-sm font-medium">
              Active
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tech Stack Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {techStack.map((stack, stackIndex) => (
          <motion.div
            key={stack.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stackIndex * 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {stack.name} Stack
              </h3>
              <div className="space-y-4">
                {stack.items.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (stackIndex * 0.1) + (index * 0.1) }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${item.color}-100`}>
                        <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">v{item.version}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${item.color}-100 text-${item.color}-600`}>
                      Active
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "API Status", value: "Operational", icon: Globe, color: "green" },
            { label: "Database", value: "Connected", icon: Database, color: "blue" },
            { label: "Server Load", value: "Normal", icon: Server, color: "purple" },
            { label: "Response Time", value: "124ms", icon: Cpu, color: "yellow" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + (index * 0.1) }}
              className={`p-4 rounded-xl bg-${stat.color}-50 border border-${stat.color}-100`}
            >
              <div className="flex items-center gap-3">
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className={`font-semibold text-${stat.color}-700`}>{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}