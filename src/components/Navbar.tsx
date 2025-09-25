import { Link, useLocation } from "react-router-dom";
import { Users, BookOpen, ClipboardCheck, Calendar, QrCode, GraduationCap } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: GraduationCap, label: "Dashboard" },
    { path: "/students", icon: Users, label: "Students" },
    { path: "/classes", icon: BookOpen, label: "Classes" },
    { path: "/tests", icon: ClipboardCheck, label: "Tests" },
    { path: "/events", icon: Calendar, label: "Events" },
    { path: "/scan", icon: QrCode, label: "QR Scan" },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-card/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SmartClass
            </h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <Link
              to="/scan"
              className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg shadow-md"
            >
              <QrCode className="w-4 h-4" />
              <span className="text-sm font-medium">Scan</span>
            </Link>
          </div>
        </div>

        {/* Mobile bottom navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
          <div className="flex items-center justify-around py-2">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;