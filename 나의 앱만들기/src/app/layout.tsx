import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CertiFlow | 수험생 맞춤형 자격증 시험 스케줄링 SaaS',
  description: '수험생의 남은 기간을 분석하여 50% 개념정독, 30% 핵심회독, 20% 기출스프린트로 완벽 역산 배치하는 AI 수험 스케줄러',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
