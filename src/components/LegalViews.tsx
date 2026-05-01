
import { motion } from "motion/react";
import { FileText, ShieldCheck, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { ReactNode } from "react";

interface LegalPageProps {
  title: string;
  children: ReactNode;
}

function LegalLayout({ title, children }: LegalPageProps) {
  return (
    <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link 
          to="/"
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 font-bold uppercase tracking-widest text-[10px]"
        >
          <ChevronLeft className="w-4 h-4" /> Quay lại trang chủ
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[2.5rem] p-10 md:p-16"
      >
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
          <div className="p-4 bg-discord/10 rounded-2xl text-discord">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter">{title}</h1>
        </div>
        
        <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-zinc-400 font-medium leading-relaxed">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export function TermsView() {
  return (
    <LegalLayout title="Điều khoản dịch vụ">
      <section>
        <h2 className="text-white text-xl font-bold mb-4">1. Chấp thuận điều khoản</h2>
        <p>Bằng cách sử dụng Ziji Bot, bạn đồng ý tuân thủ các điều khoản này và Quy định dịch vụ của Discord. Nếu bạn không đồng ý, vui lòng ngừng sử dụng dịch vụ ngay lập tức.</p>
      </section>
      
      <section>
        <h2 className="text-white text-xl font-bold mb-4">2. Quyền hạn sử dụng</h2>
        <p>Ziji Bot cung cấp các tính năng giải trí, âm nhạc và quản trị máy chủ. Bạn không được sử dụng bot cho các mục đích vi phạm pháp luật hoặc quấy rối người dùng khác.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-bold mb-4">3. Giới hạn trách nhiệm</h2>
        <p>Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng hoặc không thể sử dụng bot. Dịch vụ được cung cấp "như hiện tại".</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-bold mb-4">4. Thay đổi điều khoản</h2>
        <p>Ziji Project có quyền cập nhật các điều khoản này bất cứ lúc nào. Việc tiếp tục sử dụng bot sau khi thay đổi có nghĩa là bạn chấp nhận các điều khoản mới.</p>
      </section>
    </LegalLayout>
  );
}

export function PrivacyView() {
  return (
    <LegalLayout title="Chính sách bảo mật">
      <div className="flex items-center gap-2 p-4 bg-blue-500/10 rounded-2xl text-blue-400 text-sm mb-8 border border-blue-500/20">
        <ShieldCheck className="w-5 h-5 flex-shrink-0" />
        <p className="font-bold uppercase tracking-wide">Quyền riêng tư của bạn là ưu tiên hàng đầu của chúng tôi.</p>
      </div>

      <section>
        <h2 className="text-white text-xl font-bold mb-4">1. Thông tin chúng tôi thu thập</h2>
        <p>Chúng tôi thu thập các thông tin tối thiểu cần thiết để vận hành bot, bao gồm: ID người dùng, ID máy chủ, và các cài đặt cấu hình trong máy chủ của bạn.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-bold mb-4">2. Cách chúng tôi sử dụng dữ liệu</h2>
        <p>Dữ liệu được sử dụng để cá nhân hóa trải nghiệm (như cấp độ RPG, số dư kinh tế) và thực hiện các lệnh quản trị do bạn yêu cầu.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-bold mb-4">3. Chia sẻ dữ liệu</h2>
        <p>Ziji cam kết không bao giờ bán hoặc chia sẻ dữ liệu người dùng cho bên thứ ba vì mục đích thương mại.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-bold mb-4">4. Quyền của bạn</h2>
        <p>Bạn có quyền yêu cầu xóa toàn bộ dữ liệu liên quan đến tài khoản của mình bằng cách liên hệ với đội ngũ hỗ trợ qua máy chủ Discord chính thức.</p>
      </section>
    </LegalLayout>
  );
}
