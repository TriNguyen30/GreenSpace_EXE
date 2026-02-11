import { Search, X } from "lucide-react";
import { useSearch } from "@/context/SearchContext";

export default function SearchBox() {
    const { keyword, setKeyword, clear } = useSearch();

    return (
        <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
            />

            {keyword && (
                <button
                    onClick={clear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}