import classNames from '@/utils/classNames';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { useRegions } from 'medusa-react';
import { useStore } from '@/lib/context/store-context';
import React from 'react';

export interface RegionPickerProps extends React.PropsWithChildren {
  className?: string;
  colorScheme?: string;
}

export interface RegionMedusa {
  regionId: string;
  countryCode: string;
}
export const RegionPicker: React.FC<RegionPickerProps> = ({
  className,
  colorScheme,
}) => {
  const { regions } = useRegions();
  const { setRegion } = useStore();

  const [medusaRegion, setMedusaRegion] = React.useState<RegionMedusa>();
  React.useEffect(() => {
    if (localStorage.getItem('medusa_region')) {
      setMedusaRegion({
        regionId:
          JSON.parse(localStorage.getItem('medusa_region') || '')?.regionId ||
          regions?.[0]?.id,
        countryCode:
          JSON.parse(localStorage.getItem('medusa_region') || '')
            ?.countryCode || regions?.[0]?.countries?.[0]?.iso_2,
      });
    }
  }, []);

  const countries = React.useMemo(() => {
    return regions?.flatMap((region) => region.countries);
  }, [regions]);
  if (countries) {
    return (
      <Dropdown.Root>
        <Dropdown.Trigger asChild>
          <button className="flex uppercase focus-visible:outline-none">
            <span
              className={classNames(
                'border-r-[0.0938rem] border-gray-900 pr-[0.5625rem]',
                { 'border-white': colorScheme === 'inverted' },
                className
              )}
            >
              {medusaRegion?.countryCode || regions?.[0]?.countries?.[0]?.iso_2}
            </span>
            <span className="pl-2">
              {regions?.find((region) => region.id === medusaRegion?.regionId)
                ?.currency_code || regions?.[0]?.currency_code}
            </span>
          </button>
        </Dropdown.Trigger>

        <Dropdown.Content
          className="dropdown-content w-56.5"
          sideOffset={29}
          align="end"
        >
          {countries.map((country) => {
            return (
              <Dropdown.Item
                className={classNames(
                  medusaRegion?.countryCode === country.iso_2 &&
                    'font-black italic text-primary',
                  'dropdown-item hover:bg-transparent'
                )}
                id={country.iso_2}
                onClick={() => {
                  setRegion(country.region_id || '', country.iso_2);
                  setMedusaRegion({
                    regionId: country.region_id || '',
                    countryCode: country.iso_2,
                  });
                }}
                key={country.id}
              >
                {country.display_name.toUpperCase()}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Content>
      </Dropdown.Root>
    );
  }
};
