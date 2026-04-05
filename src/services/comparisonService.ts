// comparisonService.ts
export const comparisonService = {
  compare: (items: any[]) => {
    return items;
  }
};

const items: any[] = [];
export const addToComparison = (item: any) => { items.push(item); return true; };
export const getComparisonCount = () => items.length;
export const isInComparison = (id: string) => items.some(i => i.id === id);
export const getMaxComparisonItems = () => 3;
export const getComparisonItems = () => items;
export const removeFromComparison = (id: string) => { const idx = items.findIndex(i => i.id === id); if(idx>-1)items.splice(idx,1); };
export const clearComparison = () => { items.length = 0; };

