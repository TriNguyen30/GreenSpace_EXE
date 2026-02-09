import { useEffect } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export type NotificationType = "success" | "error" | "info";

interface NotificationProps {
    type: NotificationType;
    message: string;
    onClose: () => void;
    duration?: number;
}

export default function Notification({
    type,
    message,
    onClose,
    duration = 3000,
}: NotificationProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case "success":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "error":
                return <XCircle className="w-5 h-5 text-red-500" />;
            case "info":
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getStyles = () => {
        switch (type) {
            case "success":
                return "bg-green-50 border-green-200 text-green-800";
            case "error":
                return "bg-red-50 border-red-200 text-red-800";
            case "info":
                return "bg-blue-50 border-blue-200 text-blue-800";
        }
    };

    return (
        <div
            className={`fixed top-5 right-5 z-50 flex items-center p-4 mb-4 text-sm border rounded-lg shadow-lg ${getStyles()}`}
            role="alert"
        >
            <div className="flex-shrink-0 mr-3">{getIcon()}</div>
            <div className="font-medium mr-8">{message}</div>
            <button
                onClick={onClose}
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8 hover:bg-opacity-20 hover:bg-black focus:ring-gray-300"
                aria-label="Close"
            >
                <span className="sr-only">Close</span>
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}
