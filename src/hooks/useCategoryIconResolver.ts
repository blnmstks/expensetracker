import { useCallback } from 'react';
import { useCategories } from '../store';
import { Category } from '../types';

type IconValue = string | number | null | undefined;

export function useCategoryIconResolver() {
  const { categoryIcons, fetchCategoryIcons } = useCategories();

  const resolveIcon = useCallback(
    (iconValue: IconValue) => {
      if (iconValue === null || iconValue === undefined) {
        return '';
      }

      const iconId =
        typeof iconValue === 'number'
          ? iconValue
          : Number.isNaN(Number(iconValue))
          ? NaN
          : Number(iconValue);

      if (Number.isFinite(iconId)) {
        const matched = categoryIcons.find((icon) => icon.id === iconId);
        if (matched?.emoji) {
          return matched.emoji;
        }

        if (matched?.emojy) {
          return matched.emojy;
        }
      }

      return typeof iconValue === 'string' ? iconValue : '';
    },
    [categoryIcons],
  );

  const resolveCategoryIcon = useCallback(
    (category: Pick<Category, 'icon'> | null | undefined) => {
      return resolveIcon(category?.icon);
    },
    [resolveIcon],
  );

  return {
    resolveIcon,
    resolveCategoryIcon,
    fetchCategoryIcons,
  };
}
