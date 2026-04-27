import { ReactNode } from "react";

type DetailSectionProps = {
    title: string;
    children: ReactNode;
};

export default function DetailSection({ title, children }: DetailSectionProps) {
    return (
        <div className="detalhes-section mb-3">
            <h6>{title}</h6>
            {children}
        </div>
    );
}