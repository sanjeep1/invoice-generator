import Image from "next/image";
import Logo from "@/public/brandlogo.svg";
import { File, FolderOpen, Printer, Repeat2, Send } from "lucide-react";

const Header = () => {
    return (
        <header className="header">
            <div className="logo">
                <Image src={Logo} alt="Invoxa Logo" width={40} height={40} />
                <b>invoxa</b>
                <i>|</i>
                <span>Invoice Studio</span>
            </div>
            <div className="header-actions">
                <button><FolderOpen />Invoices</button>
                <button><Repeat2 /> Reset</button>
                <button><Printer /> Print</button>
                <button><File /> Doc</button>
                <button><Send /> Send</button>
            </div>
        </header>
    )
}

export default Header