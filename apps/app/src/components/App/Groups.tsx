import {
  Spacer,
  Box,
  ExpandableLists,
  Dropdown,
  LabelColor,
} from '@avsync.live/formation'
import React, { useState } from 'react'

type List = {
  expanded: boolean,
  value: {
    item: {
      label: string,
      labelColor: LabelColor
    },
    list: {
      subtitle: string,
      href: string
    }[]
  }
}

type Lists = List[]

export const Groups = React.memo(() => {
  const [value, set_value] = useState<Lists>([
    {
      expanded: true,
      value: {
        item: {
          label: 'Group 1',
          labelColor: 'none',
        },
        list: [
          {
            subtitle: 'Channel 1',
            href: '/group1/channel1'
          },
          {
            subtitle: 'Channel 2',
            href: '/group1/channel2'
          }
        ],
      },
    },
    {
      expanded: false,
      value: {
        item: {
          label: 'Group 2',
          labelColor: 'none',
        },
        list: [
          {
            subtitle: 'Channel 1',
            href: '/group2/channel1'
          },
          {
            subtitle: 'Channel 2',
            href: '/group2/channel2'
          }
        ],
      },
    }
  ])

  return (
    <>
      <ExpandableLists
        value={value.map((expandableList, i) => ({
          reorderId: `list_${i}`,
          ...expandableList,
          value: {
            item: {
              ...expandableList.value.item,
              iconPrefix: 'fas',
              children: <div onClick={e => e.stopPropagation()}>
                <Spacer />
                <Box height={2}>
                  <Dropdown
                    icon='ellipsis-h'
                    iconPrefix='fas'
                    minimal
                    minimalIcon
                    circle
                    items={[
                      {
                        text: 'Edit',
                        icon: 'edit',
                        iconPrefix: 'fas',
                        href: `/groups/${i}/edit`
                      },
                      {
                        text: 'Remove',
                        icon: 'trash-alt',
                        iconPrefix: 'fas',
                        onClick: () => console.log('Remove group')
                      }
                    ]}
                  />
                </Box>
              </div>
            },
            list: expandableList.value.list.map(listItem => ({
              ...listItem,
              children: <div onClick={e => {
                e.stopPropagation()
                e.preventDefault()
              }}>
                <Box height={1.65}>
                  <Dropdown
                    icon={'ellipsis-h'}
                    iconPrefix='fas'
                    key={`dropdown_${i}`}
                    minimal
                    minimalIcon
                    items={[
                      {
                        text: 'Edit',
                        icon: 'edit',
                        iconPrefix: 'fas',
                        href: `/groups/${i}/channels/edit`
                      },
                      {
                        text: 'Suggest emoji',
                        icon: 'lightbulb',
                        iconPrefix: 'fas',
                        onClick: () => console.log('Suggest emoji')
                      },
                      {
                        text: 'Remove',
                        icon: 'trash-alt',
                        iconPrefix: 'fas',
                        onClick: () => console.log('Remove channel')
                      }
                    ]}
                  />
                </Box>
              </div>
            }))
          }
        }))}
        onExpand={index => set_value(value.map((item, i) => i === index ? ({...item, expanded: !item.expanded}) : item))}
      />
    </>
  )
})
