import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Award, Truck, Package } from "lucide-react";
import { useState } from "react";

interface TaskCardProps {
  task: {
    id: string;
    task_type: string;
    status: string;
    pickup_location: string;
    delivery_location?: string;
    scheduled_time: string;
    estimated_duration?: number;
    points_awarded?: number;
    donation?: {
      title: string;
      food_category: string;
    };
  };
  showActions?: boolean;
  onStatusUpdate?: (taskId: string, status: string) => void;
}

export default function TaskCard({ task, showActions = false, onStatusUpdate }: TaskCardProps) {
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'pickup': return Truck;
      case 'delivery': return Package;
      default: return Truck;
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!onStatusUpdate) return;
    
    setLoading(true);
    try {
      await onStatusUpdate(task.id, newStatus);
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextAction = (): { action: string; label: string } | null => {
    switch (task.status) {
      case 'pending': return { action: 'accepted', label: 'Accept Task' };
      case 'accepted': return { action: 'in_progress', label: 'Start Task' };
      case 'in_progress': return { action: 'completed', label: 'Complete Task' };
      default: return null;
    }
  };

  const nextAction = getNextAction();
  const TaskIcon = getTaskTypeIcon(task.task_type);

  return (
    <Card className="hover:shadow-hover transition-all duration-300 border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-tight flex items-center gap-2">
              <TaskIcon className="h-5 w-5 text-primary" />
              {task.donation?.title || `${task.task_type} Task`}
            </CardTitle>
            <CardDescription className="text-sm">
              {task.task_type === 'pickup' ? 'Food pickup required' : 'Delivery task'}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(task.status)}>
            {task.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Pickup: {task.pickup_location}</span>
          </div>
          
          {task.delivery_location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Delivery: {task.delivery_location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>
              {new Date(task.scheduled_time).toLocaleString()}
            </span>
          </div>
          
          {task.estimated_duration && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>~{task.estimated_duration} minutes</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-volunteer" />
            <span className="text-sm font-medium text-volunteer">
              +{task.points_awarded || 10} points
            </span>
          </div>
          
          {task.donation?.food_category && (
            <Badge variant="outline" className="text-xs">
              {task.donation.food_category}
            </Badge>
          )}
        </div>

        {showActions && nextAction && (
          <Button 
            onClick={() => handleStatusUpdate(nextAction.action)}
            disabled={loading}
            className="w-full bg-gradient-to-r from-volunteer to-blue-600 hover:shadow-glow"
          >
            {loading ? 'Updating...' : nextAction.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}