
import { motion } from "motion/react";
import { Music, Sword, Coins, ShieldCheck, Heart, Radio, ListMusic, Gamepad2 } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: <Music className="w-8 h-8 text-blue-400" />,
      title: "Âm nhạc chất lượng cao",
      desc: "Phát nhạc từ YouTube, Spotify, SoundCloud với độ trễ cực thấp và âm thanh sống động."
    },
    {
      icon: <Sword className="w-8 h-8 text-red-400" />,
      title: "Hệ thống RPG & Game",
      desc: "Tham gia vào các cuộc phiêu lưu, đánh boss và thu thập vật phẩm cùng bạn bè."
    },
    {
      icon: <Coins className="w-8 h-8 text-yellow-400" />,
      title: "Nền kinh tế (Economy)",
      desc: "Hệ thống tiền tệ đầy đủ với công việc, đánh bạc và cửa hàng vật phẩm ảo."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-green-400" />,
      title: "Quản trị máy chủ",
      desc: "Tự động hóa việc lọc tin nhắn, quản lý vai trò và bảo vệ máy chủ khỏi spam."
    },
    {
      icon: <Heart className="w-8 h-8 text-pink-400" />,
      title: "Giải trí & Anime",
      desc: "Tìm kiếm thông tin anime, waifu và các lệnh vui vẻ cho cộng đồng."
    },
    {
      icon: <Gamepad2 className="w-8 h-8 text-purple-400" />,
      title: "Trò chơi tương tác",
      desc: "Các trò chơi mini ngay trong Discord để gắn kết các thành viên."
    }
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tighter leading-none">
          Mô-đun hóa sự <span className="text-gradient">Phát triển</span>
        </h2>
        <p className="text-zinc-500 max-w-2xl mx-auto font-medium text-lg">
          Ziji được xây dựng với kiến trúc hiện đại, hỗ trợ hàng loạt tính năng mạnh mẽ cho mọi quy mô cộng đồng.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group p-10 glass rounded-[3rem] hover:bg-white/5 transition-all duration-500 border-white/5 hover:border-discord/30"
          >
            <div className="mb-8 p-5 bg-white/5 border border-white/10 rounded-[2rem] w-fit group-hover:glow group-hover:scale-110 transition-all duration-500">
              {f.icon}
            </div>
            <h3 className="text-2xl font-bold mb-4 tracking-tight">{f.title}</h3>
            <p className="text-zinc-400 font-medium leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
