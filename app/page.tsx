"use client";
import Header from "@/components/Header";
import { useMemo, useState } from "react";
type Item = { id: number; name: string; qty: number; rate: number };
const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});
const Field = ({ label, value }: { label: string; value: string }) => (
    <label className="control">
        <span>{label}</span>
        <input defaultValue={value} />
    </label>
);
export default function Home() {
    const [items, setItems] = useState<Item[]>([
        { id: 1, name: "Identity & strategy workshop", qty: 1, rate: 1800 },
        { id: 2, name: "Website interface design", qty: 2, rate: 1250 },
    ]);
    const subtotal = useMemo(
        () => items.reduce((sum, i) => sum + i.qty * i.rate, 0),
        [items],
    );
    const tax = subtotal * 0.19;
    const add = () =>
        setItems([
            ...items,
            { id: Date.now(), name: "New line item", qty: 1, rate: 0 },
        ]);
    const change = (id: number, key: keyof Item, value: string) =>
        setItems((list) =>
            list.map((i) =>
                i.id === id
                    ? { ...i, [key]: key === "name" ? value : Number(value) }
                    : i,
            ),
        );
    return (
        <main className="app-shell">
            <Header />
            <section className="utility-bar">
                <div>
                    <span className="notice-icon">●</span>
                    <b>Draft invoice</b>
                    <span>·</span>
                    <span>Autosaved locally — ready to export when you are.</span>
                </div>
                <div className="utility-actions">
                    <button>↔ Switch layout</button>
                    <button>⎙ Clone</button>
                    <button>♧ Clear all</button>
                    <button className="publish">↗ Publish invoice</button>
                    <button>•••</button>
                </div>
            </section>
            <div className="workspace">
                <section className="editor">
                    <section className="card meta-card">
                        <div className="card-heading">
                            <h2>▣ Invoice Setup &amp; Numbering</h2>
                            <span className="tag">METADATA #01</span>
                        </div>
                        <div className="metadata">
                            <Field label="Invoice Number" value="INV-2025-084" />
                            <Field label="Issue Date" value="03/01/2025" />
                            <Field label="Payment Terms" value="Net 15 Days" />
                            <Field label="Currency" value="USD ($)" />
                        </div>
                    </section>
                    <div className="dual">
                        <Details
                            title="⌂ Your Details (Issuer)"
                            side="Sender"
                            values={[
                                ["Freelancer or Studio Name", "Julian Vance"],
                                [
                                    "Business Entity / Trading Title",
                                    "Vance Interactive Studio Ltd.",
                                ],
                                ["Business Email", "billing@vancestudio.design"],
                                ["Tax / VAT ID", "EU849204910"],
                                ["Country / City", "Berlin, Germany"],
                            ]}
                        />
                        <Details
                            title="♙ Client Details"
                            side="Recipient"
                            values={[
                                ["Client or Company Name", "Aster & Co."],
                                ["Contact Person", "Marina Ellis"],
                                ["Client Email", "hello@asterandco.com"],
                                ["Tax / VAT ID", "US 94-2298120"],
                                ["Country / City", "New York, USA"],
                            ]}
                        />
                    </div>
                    <section className="card items-card">
                        <div className="card-heading">
                            <h2>☷ Line Items</h2>
                            <button className="link-button" onClick={add}>
                                + Add line item
                            </button>
                        </div>
                        <div className="item-head">
                            <span>Description</span>
                            <span>Qty.</span>
                            <span>Rate</span>
                            <span>Amount</span>
                        </div>
                        {items.map((item) => (
                            <div className="item-row" key={item.id}>
                                <input
                                    value={item.name}
                                    onChange={(e) => change(item.id, "name", e.target.value)}
                                />
                                <input
                                    type="number"
                                    value={item.qty}
                                    onChange={(e) => change(item.id, "qty", e.target.value)}
                                />
                                <input
                                    type="number"
                                    value={item.rate}
                                    onChange={(e) => change(item.id, "rate", e.target.value)}
                                />
                                <output>{fmt.format(item.qty * item.rate)}</output>
                            </div>
                        ))}
                        <div className="items-note">
                            Tip: Add a short, scannable description for each service or
                            deliverable.
                        </div>
                    </section>
                    <section className="card notes-card">
                        <div className="card-heading">
                            <h2>⌁ Notes &amp; Payment Details</h2>
                            <span className="tag neutral">OPTIONAL</span>
                        </div>
                        <textarea defaultValue="Thank you for the opportunity to collaborate. Payment is due within 15 days of the invoice date." />
                        <div className="bank">
                            <span>▤</span>
                            <div>
                                <b>Payment instructions</b>
                                <small>
                                    Account: DE89 3704 0044 0532 0130 00 · BIC: COBADEFFXXX
                                </small>
                            </div>
                            <button>Edit</button>
                        </div>
                    </section>
                </section>
                <aside className="preview">
                    <div className="preview-top">
                        <span>▣ LIVE INVOICE PREVIEW</span>
                        <div>
                            <button>−</button>
                            <b>100%</b>
                            <button>+</button>
                        </div>
                    </div>
                    <article className="invoice-paper">
                        <div className="paper-brand">
                            <span>▰</span>
                            <b>VANCE</b>
                            <small>INTERACTIVE STUDIO</small>
                        </div>
                        <div className="paper-title">
                            <div>
                                <h1>INVOICE</h1>
                                <p>INV-2025-084</p>
                            </div>
                            <div>
                                <span>ISSUED</span>
                                <b>March 01, 2025</b>
                                <span>DUE</span>
                                <b>March 16, 2025</b>
                            </div>
                        </div>
                        <div className="addresses">
                            <div>
                                <span>FROM</span>
                                <b>Julian Vance</b>
                                <p>
                                    Vance Interactive Studio Ltd.
                                    <br />
                                    Berlin, Germany
                                    <br />
                                    billing@vancestudio.design
                                </p>
                            </div>
                            <div>
                                <span>BILL TO</span>
                                <b>Aster &amp; Co.</b>
                                <p>
                                    Attn. Marina Ellis
                                    <br />
                                    New York, USA
                                    <br />
                                    hello@asterandco.com
                                </p>
                            </div>
                        </div>
                        <div className="paper-items">
                            <div>
                                <span>DESCRIPTION</span>
                                <span>QTY</span>
                                <span>RATE</span>
                                <span>AMOUNT</span>
                            </div>
                            {items.map((i) => (
                                <div key={i.id}>
                                    <p>{i.name}</p>
                                    <span>{i.qty}</span>
                                    <span>{fmt.format(i.rate)}</span>
                                    <b>{fmt.format(i.qty * i.rate)}</b>
                                </div>
                            ))}
                        </div>
                        <div className="totals">
                            <span>
                                Subtotal <b>{fmt.format(subtotal)}</b>
                            </span>
                            <span>
                                VAT (19%) <b>{fmt.format(tax)}</b>
                            </span>
                            <strong>
                                Total due <b>{fmt.format(subtotal + tax)}</b>
                            </strong>
                        </div>
                        <div className="paper-bottom">
                            <b>Payment details</b>
                            <p>
                                IBAN: DE89 3704 0044 0532 0130 00
                                <br />
                                BIC: COBADEFFXXX
                            </p>
                            <small>Thank you for your business.</small>
                        </div>
                    </article>
                </aside>
            </div>
            <aside className="export-drawer">
                <div className="shortcuts">
                    <b>Keyboard shortcuts</b>
                    <span>
                        <kbd>⌘</kbd> + <kbd>S</kbd> Save draft
                    </span>
                    <span>
                        <kbd>⌘</kbd> Export
                    </span>
                </div>
                <div>
                    <button>✉ Send via Email</button>
                    <button>⇩ Export .docx</button>
                    <button className="pdf">⇩ 1-Click PDF</button>
                </div>
            </aside>
            <footer>
                <span>© 2025 Invoxa Studio. Built for independent work.</span>
                <span>
                    <i /> Secure workspace · Your data stays private
                </span>
            </footer>
        </main>
    );
}
function Details({
    title,
    side,
    values,
}: {
    title: string;
    side: string;
    values: string[][];
}) {
    return (
        <section className="card details">
            <div className="card-heading">
                <h3>{title}</h3>
                <small>{side}</small>
            </div>
            <div className="upload">
                <span>▧</span>
                <div>
                    <b>Brand / Studio Logo</b>
                    <small>PNG, JPG or SVG on live letterhead</small>
                </div>
                <button>↥ Upload</button>
            </div>
            {values.map(([label, value]) => (
                <Field key={label} label={label} value={value} />
            ))}
        </section>
    );
}
