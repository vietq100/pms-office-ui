import React, { useEffect, useState, useCallback } from 'react'
import { SubCategoryItem } from './SubCategoryItem'
import { ISubCategoryContainerProps } from './SubCategory.d'
import update from 'immutability-helper'

export interface Item {
  id: number
  text: string
}

export interface SubCategoryContainerState {
  cards: Item[]
}

export const SubCategoryContainer: React.FC<ISubCategoryContainerProps> = ({
  listSubCategory,
  onUpdateSort,
  activateOrDeactivate
}) => {
  {
    const [cards, setCards] = useState([])

    useEffect(() => {
      setCards(listSubCategory)
    }, [listSubCategory])

    const moveCard = useCallback(
      (dragIndex: number, hoverIndex: number) => {
        const dragCard = cards[dragIndex]
        setCards(
          update(cards, {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, dragCard]
            ]
          })
        )
      },
      [cards]
    )

    const onFinishedDrag = useCallback(() => {
      const ids = cards.map((item: any) => item.id)
      onUpdateSort(ids)
    }, [cards])

    const renderCard = (card: { id: number; name: string; isActive: boolean }, index: number) => {
      return (
        <SubCategoryItem
          key={card.id}
          index={index}
          id={card.id}
          text={card.name}
          isActive={card.isActive}
          moveCard={moveCard}
          onFinishedDrag={onFinishedDrag}
          activateOrDeactivate={activateOrDeactivate}
        />
      )
    }

    return (
      <>
        <div>{cards.map((card, i) => renderCard(card, i))}</div>
      </>
    )
  }
}
