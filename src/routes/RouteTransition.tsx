import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Loading from "@/components/ui/Loading";

export default function RouteTransition({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);

        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [location]);

    if (loading) return <Loading />;

    return <>{children}</>;
}
