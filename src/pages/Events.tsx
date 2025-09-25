import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Search, Bell, AlertCircle, Info } from "lucide-react";
import eventsData from "@/data/events.json";
import classesData from "@/data/classes.json";

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "high-priority">("all");

  // Filter events based on search and filter criteria
  const now = new Date();
  const filteredEvents = eventsData.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const eventDate = new Date(event.date);
    
    switch (filter) {
      case "upcoming":
        return matchesSearch && eventDate > now;
      case "high-priority":
        return matchesSearch && event.priority === "high";
      default:
        return matchesSearch;
    }
  });

  // Sort events by date
  const sortedEvents = filteredEvents.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Get class name from ID
  const getClassName = (classId: string) => {
    const classItem = classesData.find(c => c.id === classId);
    return classItem ? classItem.subject : "Unknown Class";
  };

  // Get event icon based on type
  const getEventIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <Bell className="w-4 h-4" />;
      case "test":
      case "quiz":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Get priority variant
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  // Check if event is today
  const isToday = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  };

  // Check if event is upcoming (within 7 days)
  const isUpcoming = (date: string) => {
    const eventDate = new Date(date);
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return eventDate > now && eventDate <= weekFromNow;
  };

  // Get upcoming events count
  const upcomingCount = eventsData.filter(event => new Date(event.date) > now).length;
  const highPriorityCount = eventsData.filter(event => event.priority === "high").length;

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Events & Announcements
        </h1>
        <p className="text-muted-foreground">
          Stay updated with class schedules, tests, and important announcements
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventsData.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search events and announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filter === "upcoming" ? "default" : "outline"}
                onClick={() => setFilter("upcoming")}
                size="sm"
              >
                Upcoming
              </Button>
              <Button
                variant={filter === "high-priority" ? "default" : "outline"}
                onClick={() => setFilter("high-priority")}
                size="sm"
              >
                High Priority
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        {sortedEvents.map((event) => {
          const eventDate = new Date(event.date);
          const isPast = eventDate < now;
          
          return (
            <Card 
              key={event.id} 
              className={`hover:shadow-lg transition-shadow ${
                isToday(event.date) ? 'ring-2 ring-primary' : 
                isUpcoming(event.date) ? 'ring-1 ring-secondary' : ''
              } ${isPast ? 'opacity-75' : ''}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      event.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                      event.priority === 'medium' ? 'bg-primary/10 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {getEventIcon(event.type)}
                    </div>
                    
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{getClassName(event.classId)}</p>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPriorityVariant(event.priority)}>
                        {event.priority}
                      </Badge>
                      <Badge variant="outline">
                        {event.type}
                      </Badge>
                    </div>
                    
                    {isToday(event.date) && (
                      <Badge variant="default" className="bg-primary">
                        Today
                      </Badge>
                    )}
                    
                    {isPast && (
                      <Badge variant="secondary">
                        Past
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{eventDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm leading-relaxed">{event.description}</p>
                </div>

                {/* Time until event */}
                {!isPast && (
                  <div className="text-xs text-muted-foreground">
                    {isToday(event.date) ? (
                      <span className="text-primary font-medium">Event is today!</span>
                    ) : isUpcoming(event.date) ? (
                      <span className="text-secondary font-medium">
                        {Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days remaining
                      </span>
                    ) : (
                      <span>
                        {Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days until event
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {sortedEvents.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No events found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Events;