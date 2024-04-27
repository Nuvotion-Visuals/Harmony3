import React, { memo } from 'react'
import { Box, Button, Dropdown, Item, scrollToElementById } from '@avsync.live/formation'

interface Props {
  activeSpaceName: string;
  activeGroupName: string;
  activeChannelName: string;
  anyExpanded: boolean;
  toggleAll: () => void;
}

export const ChannelControls = memo(({
  activeSpaceName,
  activeGroupName,
  activeChannelName,
  anyExpanded,
  toggleAll,
}: Props) => {
  return (
    <Box py={0.5}>
      <Item
        text={`${activeSpaceName} > ${activeGroupName} > ${activeChannelName}`}
        absoluteRightChildren
        onClick={toggleAll}
      >
        <Box>
          <Button
            icon={'arrow-up'}
            iconPrefix='fas'
            compact
            square
            minimal
            onClick={(e) => {
              e.stopPropagation()
              scrollToElementById('top', { behavior: 'smooth'})
            }}
            title='Scroll to top'
          />
          <Button
            icon={'arrow-down'}
            iconPrefix='fas'
            compact
            square
            minimal
            onClick={(e) => {
              e.stopPropagation()
              scrollToElementById('bottom', { behavior: 'smooth', block: 'end'})
            }}
            title='Scroll to bottom'
          />
          <Button
            icon={anyExpanded ? 'chevron-up' : 'chevron-down'}
            iconPrefix='fas'
            compact
            square
            minimal
          />
          <Dropdown
            icon='ellipsis-h'
            iconPrefix='fas'
            compact
            square
            minimal
            items={[
              {
                icon: 'edit',
                iconPrefix: 'fas',
                compact: true,
                text: 'Edit',
                onClick: () => {},
              },
              {
                icon: 'trash-alt',
                iconPrefix: 'fas',
                compact: true,
                text: 'Delete',
                onClick: () => {},
              },
            ]}
          />
        </Box>
      </Item>
    </Box>
  );
})
