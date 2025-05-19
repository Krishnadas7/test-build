type Props = {
    items: { name: string; _id: string }[];
    setItems: (id: string) => void;
    itemLabel: string;
};

const Select = ({ items, setItems, itemLabel }: Props) => {
    return (
        <div className="flex gap-2 justify-center items-center text-base">
            <label className="text-md font-normal">{itemLabel}: </label>
            <select
                className="border-0 rounded-md py-1 px-2 bg-white text-black"
                onChange={(e) => setItems(e.target.value)}
            >
                <option value="" disabled selected>
                    Select {itemLabel}
                </option>
                {items &&
                    items.map((item, index) => (
                        <option value={item._id} key={index}>
                            {item.name}
                        </option>
                    ))}
            </select>
        </div>
    );
};

export default Select;
