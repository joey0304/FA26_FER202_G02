
import { createContext, useContext, useState } from 'react';

const Context = createContext(null);
const KEY = 'carstore_lab_compare';

export function CompareProvider({ children }) {
    const [ids, setIds] = useState(() => {
        try {
            const values = JSON.parse(sessionStorage.getItem(KEY) || '[]');
            return Array.isArray(values)
                ? values.filter(Number.isInteger).slice(0, 3)
                : [];
        } catch {
            return [];
        }
    });

    function update(next) {
        sessionStorage.setItem(KEY, JSON.stringify(next));
        setIds(next);
    }

    function toggle(id) {
        if (ids.includes(id)) {
            update(ids.filter(x => x !== id));
            return;
        }

        if (ids.length >= 3) {
            throw new Error('Bạn chỉ có thể so sánh tối đa 3 xe. Hãy bỏ một xe trước.');
        }

        update([...ids, id]);
    }

    return (
        <Context.Provider
            value={{
                ids,
                toggle,
                remove: id => update(ids.filter(x => x !== id)),
                clear: () => update([])
            }}
        >
            {children}
        </Context.Provider>
    );
}

export const useCompare = () => useContext(Context);
