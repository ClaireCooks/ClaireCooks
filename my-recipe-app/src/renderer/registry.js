import HeroBlock from './blocks/HeroBlock'
import IngredientsBlock from './blocks/IngredientsBlock'
import InstructionsBlock from './blocks/InstructionsBlock'
import NotesBlock from './blocks/NotesBlock'
import NutritionBlock from './blocks/NutritionBlock'
import MediaBlock from './blocks/MediaBlock'

export const blockComponents = {
  hero: HeroBlock,
  ingredients: IngredientsBlock,
  instructions: InstructionsBlock,
  notes: NotesBlock,
  nutrition: NutritionBlock,
  media: MediaBlock,
}

export function getBlockComponent(type) {
  return blockComponents[type] || null
}
