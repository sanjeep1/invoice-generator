export default function Footer() {
    return (
        <footer className="fixed right-0 bottom-0 left-0 z-10 flex h-12 items-center justify-between border-t border-line bg-white px-6 text-[11px] text-muted">
            <span>© 2026 Invoxa Studio. Built for independent work by <a href="https://sanjeepbanjara.com.np" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Sanjeep Banjara
            </a>.</span>
            <span>
                <i className="mr-1 inline-block size-2 rounded-full bg-[#21a465]" /> Secure
                workspace · Your data stays private
            </span>
        </footer>
    );
}
