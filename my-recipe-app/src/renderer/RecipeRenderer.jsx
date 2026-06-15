import { getBlockComponent } from './registry'

function RecipeRenderer({ recipe }) {
  if (!recipe || !recipe.blocks) {
    return null
  }

  return (
    <article className="recipe">
      {recipe.blocks.map((block, index) => {
        const Block = getBlockComponent(block.type)

        if (!Block) {
          console.warn(`No component found for block type: ${block.type}`)
          return null
        }

        return (
          <Block
            key={`${block.type}-${index}`}
            block={block}
            recipe={recipe}
          />
        )
      })}
    </article>
  )
}

export default RecipeRenderer
