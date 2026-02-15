import { Link } from "react-router-dom";
import {
    Sun,
    Droplets,
    Leaf,
    Scissors,
    Sprout,
    Bug,
    ThermometerSun,
    BookOpen,
} from "lucide-react";

const tips = [
    {
        icon: Sun,
        title: "Ánh sáng",
        description:
            "Bonsai cần ánh sáng gián tiếp, tránh nắng gắt buổi trưa. Đặt gần cửa sổ hướng Đông hoặc Nam, xoay chậu định kỳ để cây phát triển đều.",
    },
    {
        icon: Droplets,
        title: "Tưới nước",
        description:
            "Tưới khi mặt đất hơi khô (ấn nhẹ ngón tay). Tưới đẫm cho đến khi nước chảy ra lỗ thoát, tránh để úng. Mùa hè có thể tưới 1–2 lần/ngày, mùa đông giảm tần suất.",
    },
    {
        icon: Leaf,
        title: "Đất và thay chậu",
        description:
            "Dùng đất thoát nước tốt (đất bonsai trộn đá perlite, đá trân châu). Thay chậu 2–3 năm/lần với cây non, 4–5 năm với cây già; tốt nhất vào đầu xuân.",
    },
    {
        icon: Scissors,
        title: "Tỉa cành và tạo dáng",
        description:
            "Tỉa cành dài, lá dày để giữ dáng. Dùng kéo sắc, cắt chéo để vết thương mau lành. Buộc dây (wire) nhẹ nhàng để tạo thế, tránh siết quá gây tổn thương vỏ.",
    },
    {
        icon: Sprout,
        title: "Bón phân",
        description:
            "Bón phân NPK cân đối hoặc phân hữu cơ pha loãng 2–4 tuần/lần trong mùa sinh trưởng (xuân–hè). Giảm hoặc ngưng bón vào thu–đông khi cây nghỉ.",
    },
    {
        icon: Bug,
        title: "Sâu bệnh",
        description:
            "Kiểm tra lá và thân thường xuyên. Rệp, nhện đỏ: rửa lá nhẹ bằng nước hoặc dùng thuốc trừ sâu sinh học. Đảm bảo thông thoáng, tránh ẩm ướt kéo dài gây nấm.",
    },
    {
        icon: ThermometerSun,
        title: "Nhiệt độ và mùa",
        description:
            "Đa số bonsai thích 15–28°C. Tránh gió lạnh, máy lạnh thổi trực tiếp. Mùa đông có thể đưa vào nơi mát, sáng; một số loài cần lạnh nhẹ để ngủ đông.",
    },
];

export default function Tips() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white pt-24 pb-14 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-10">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6 sm:px-10 sm:py-8">
                        <div className="flex items-center gap-3 text-white/90 mb-2">
                            <BookOpen className="w-6 h-6" />
                            <span className="text-sm font-semibold uppercase tracking-wide">
                                Mẹo chăm sóc
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
                            Cách chăm sóc Bonsai
                        </h1>
                        <p className="text-green-50 text-lg max-w-2xl leading-relaxed">
                            Bonsai là nghệ thuật thu nhỏ cây cảnh. Chỉ cần chú ý ánh sáng, nước,
                            đất và tỉa tạo dáng đúng cách, cây sẽ sống lâu và đẹp.
                        </p>
                    </div>
                </div>

                {/* Tips list */}
                <div className="space-y-4">
                    {tips.map((tip, index) => {
                        const Icon = tip.icon;
                        return (
                            <article
                                key={tip.title}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7 hover:shadow-md transition-shadow"
                            >
                                <div className="flex gap-4 sm:gap-5">
                                    <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                                {index + 1}
                                            </span>
                                            <h2 className="text-xl font-bold text-gray-900">
                                                {tip.title}
                                            </h2>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed">
                                            {tip.description}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* CTA */}
                <div className="mt-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl text-white p-6 sm:p-8 text-center shadow-lg">
                    <p className="text-green-50 text-lg font-medium mb-4">
                        Mỗi loài bonsai có nhu cầu khác nhau — hãy hỏi chúng tôi khi mua để được tư vấn cụ thể.
                    </p>
                    <Link
                        to="/contact"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-green-700 px-6 py-3 font-semibold hover:bg-green-50 transition-colors"
                    >
                        Liên hệ tư vấn
                    </Link>
                </div>
            </div>
        </div>
    );
}
