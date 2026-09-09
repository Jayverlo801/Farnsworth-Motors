# Farnsworth Motors inventory image library
Created September 8, 2026 using the built-in image generation tool.

Twenty individual studio images of popular US-market vehicles, with selected model years spanning 2018–2024. Each vehicle is an illustrative sample, not a photograph of actual Farnsworth stock. Model-year styling, trim, and badge details are generated approximations. No VINs, pricing, repair history, or availability are asserted by this asset collection.

## Deliverables
- `originals/`: 20 unaltered PNG originals at 1536 × 1024.
- `../../../public/images/inventory/us-bestsellers-2018-2024/`: 20 full-size WebP images, 20 compact 800px card WebPs, a manifest, an offline gallery, and a labeled contact sheet.
- `generation-plan.json`: complete final prompt for every image and the selection sources.
- `source-map.json`: provenance paths of the built-in tool outputs.
- `package-assets.cjs`: copies originals and performs local encoding, thumbnailing, and contact-sheet assembly using Sharp; it does not generate or change vehicle designs.

The public folder is directly usable at `/images/inventory/us-bestsellers-2018-2024/`. Set an inventory image source to a manifest entry's `src` when using these in a labeled sample/design context. The smaller `thumbnail` field is suitable for inventory cards. All images have a 3:2 ratio; the project's approximately 20:13 card crop removes only a narrow strip vertically.

## Visual direction
Front driver-side three-quarter view, nose left, charcoal seamless studio, matte graphite floor, softbox lighting, neutral paint reflections, full vehicle in frame. Silver, white, graphite, deep blue, and muted gray-green keep the collection consistent with the Farnsworth brand.

## Vehicle roster
| Year | Vehicle | Trim | Color |
| --- | --- | --- | --- |
| 2021 | Ford F-150 | XLT | Oxford White |
| 2020 | Chevrolet Silverado 1500 | LT | Satin Steel Metallic |
| 2022 | Ram 1500 | Big Horn | Granite Crystal Metallic |
| 2021 | Toyota RAV4 | XLE | Lunar Rock |
| 2020 | Honda CR-V | EX-L | Obsidian Blue Pearl |
| 2022 | Toyota Camry | SE | Celestial Silver Metallic |
| 2021 | Nissan Rogue | SV | Pearl White |
| 2019 | Chevrolet Equinox | LT | Nightfall Gray Metallic |
| 2018 | Honda Civic | EX | Modern Steel Metallic |
| 2020 | Toyota Corolla | SE | Super White |
| 2019 | Honda Accord | Sport | Still Night Pearl |
| 2023 | Toyota Tacoma | SR5 | Celestial Silver Metallic |
| 2023 | GMC Sierra 1500 | SLE | Summit White |
| 2021 | Jeep Grand Cherokee | Limited | Diamond Black Crystal Pearl |
| 2022 | Ford Explorer | XLT | Carbonized Gray Metallic |
| 2018 | Ford Escape | SEL | Blue Metallic |
| 2023 | Toyota Highlander | XLE | Magnetic Gray Metallic |
| 2019 | Jeep Wrangler | Unlimited Sahara | Billet Silver Metallic |
| 2020 | Nissan Altima | SV | Gun Metallic |
| 2024 | Tesla Model Y | Long Range | Pearl White Multi-Coat |

## Selection basis
This is a curated set of 20 high-volume nameplates appearing in US bestseller coverage during the requested period, rather than a computed cumulative sales ranking. The assigned model years illustrate the requested year range; the sources describe calendar-year sales across the whole nameplate, not sales of these exact model-year/trim combinations. F-Series, Silverado, Ram pickup, and Sierra sales commonly aggregate light- and heavy-duty variants; the images use their familiar light-duty models.

- [Car and Driver: The Best-Selling Cars, Trucks, and SUVs of 2018](https://www.caranddriver.com/news/g25558401/best-selling-cars-suv-trucks-2018/)
- [Car and Driver: Top 25 Bestselling Cars, Trucks, and SUVs of 2021](https://www.caranddriver.com/news/g36005989/best-selling-cars-2021/)
- [Car and Driver: The 25 Bestselling Cars, Trucks, and SUVs of 2024](https://www.caranddriver.com/news/g60385784/bestselling-cars-2024/)

The existing live/sample inventory rows and hero work are not modified by this asset package. Production listings should use photographs of each actual vehicle.

