type TabItem<T extends string> = {
  key: T;
  label: string;
};

type ModalTabsProps<T extends string> = {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
};

export default function ModalTabs<T extends string>({
  tabs,
  activeTab,
  onChange
}: ModalTabsProps<T>) {
  return (
    <ul className="nav nav-pills modal-tabs-bootstrap mb-4">
      {tabs.map((tab) => (
        <li className="nav-item" key={tab.key}>
          <button
            className={`nav-link ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        </li>
      ))}
    </ul>
  );
}