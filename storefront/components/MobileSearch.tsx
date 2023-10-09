import React from 'react';
import { Icon } from './ui/Icon';
import { useRouter } from 'next/router';

interface MobileSearchProps {
  setIsOffcanvasOpen: (canvas: boolean) => void;
}
export const MobileSearch: React.FC<MobileSearchProps> = ({
  setIsOffcanvasOpen,
}) => {
  const [search, setSearch] = React.useState('');
  const router = useRouter();
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      router.push({
        pathname: '/search',
        query: { search: search },
      });
      setSearch('');
      setIsOffcanvasOpen(false);
    }
  };
  const handleClick = () => {
    router.push({
      pathname: '/search',
      query: { search: search },
    });
    setSearch('');
    setIsOffcanvasOpen(false);
  };

  return (
    <div className="relative flex h-21 items-center gap-4 border-b border-white px-4">
      <button onClick={handleClick}>
        <Icon name="search" />
      </button>

      <input
        type="text"
        className="w-full bg-transparent px-1 py-1 text-white placeholder:text-white focus-visible:outline-0"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          handleKeyDown(e);
        }}
      />
    </div>
  );
};
