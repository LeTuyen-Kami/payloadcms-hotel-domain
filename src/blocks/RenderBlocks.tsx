import React, { Fragment } from 'react'

import type { Page, SiteSetting } from '@/payload-types'

import { AboutBlock } from '@/blocks/About/Component'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { PricingBlock } from '@/blocks/Pricing/Component'
import { RoomsBlockComponent } from '@/blocks/RoomsBlock/Component'
import { GoogleReviewsBlockComponent } from '@/blocks/GoogleReviews/Component'
import { ContactBlock } from '@/blocks/Contact/Component'

const blockComponents = {
  about: AboutBlock,
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  pricing: PricingBlock,
  roomsBlock: RoomsBlockComponent,
  googleReviewsBlock: GoogleReviewsBlockComponent,
  contactBlock: ContactBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
  siteSettings?: SiteSetting | null
}> = (props) => {
  const { blocks, siteSettings } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType as keyof typeof blockComponents]

            if (Block) {
              return (
                <div className="my-16" key={index}>
                  {/* @ts-expect-error there is a mismatch between the block type and the component type */}
                  <Block {...block} siteSettings={siteSettings} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
