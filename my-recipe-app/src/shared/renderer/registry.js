import HeroBlock from './blocks/HeroBlock'
import IngredientsBlock from './blocks/IngredientsBlock'
import InstructionsBlock from './blocks/InstructionsBlock'
import NotesBlock from './blocks/NotesBlock'
import NutritionBlock from './blocks/NutritionBlock'
import MediaBlock from './blocks/MediaBlock'
import GalleryBlock from './blocks/GalleryBlock'

export const blockComponents = {
  hero: HeroBlock,
  ingredients: IngredientsBlock,
  instructions: InstructionsBlock,
  notes: NotesBlock,
  nutrition: NutritionBlock,
  media: MediaBlock,
  gallery: GalleryBlock,
}

export function getBlockComponent(type) {
  return blockComponents[type] || null
}
