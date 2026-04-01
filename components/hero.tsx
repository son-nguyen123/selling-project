'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-accent to-accent/80 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-6">
        {/* Left text */}
        <div className="flex-1 text-center md:text-left">
          <p className="text-accent-foreground/80 text-sm font-medium mb-1 uppercase tracking-wide">
            Nền tảng mua bán dự án số #1
          </p>
          <h1 className="text-2xl md:text-4xl font-bold text-accent-foreground mb-3 leading-tight">
            Khám phá & Mua bán<br className="hidden md:block" /> Dự án lập trình
          </h1>
          <p className="text-accent-foreground/80 text-sm mb-4 max-w-md">
            Hàng nghìn dự án chất lượng cao từ các lập trình viên hàng đầu. Tải về ngay sau khi mua.
          </p>
          <div className="flex gap-3 justify-center md:justify-start">
            <Link
              href="/?category=All"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-accent-foreground text-accent font-semibold text-sm rounded-sm hover:bg-accent-foreground/90 transition-colors"
            >
              Mua sắm ngay
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sell"
              className="inline-flex items-center gap-1.5 px-5 py-2 border border-accent-foreground text-accent-foreground font-medium text-sm rounded-sm hover:bg-accent-foreground/10 transition-colors"
            >
              Bắt đầu bán
            </Link>
          </div>
        </div>

        {/* Right stats */}
        <div className="flex gap-6 md:gap-10 shrink-0">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-accent-foreground">2.500+</p>
            <p className="text-accent-foreground/80 text-xs mt-0.5">Dự án</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-accent-foreground">150K+</p>
            <p className="text-accent-foreground/80 text-xs mt-0.5">Người dùng</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-accent-foreground">4.8★</p>
            <p className="text-accent-foreground/80 text-xs mt-0.5">Đánh giá</p>
          </div>
        </div>
      </div>
    </section>
  )
}
