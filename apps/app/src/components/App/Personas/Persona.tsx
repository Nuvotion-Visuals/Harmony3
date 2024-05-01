import { TextInput, Button, RichTextEditor, Page, Box, Item, FileUpload, Gap, Select, AspectRatio, FileDrop, Dropdown, StyleHTML, markdownToHTML, useDialog, ContextMenu, ItemProps, LineBreak } from '@avsync.live/formation'
import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useSpaces_currentUserId } from 'redux-tk/spaces/hooks'
import { pb } from 'redux-tk/pocketbase'
import { usePersonas_activePersona, usePersonas_setActivePersonaId } from 'redux-tk/personas/hooks'
import { ConfirmationMessage } from 'components/Util/ConfirmationMessage'
import { useRemoveQueryParam } from 'utils/removeEditQuery'
import { ImageDropTarget } from 'components/Util/ImageDrop'
import { ImageSuggestions } from 'components/App/Suggestions/ImageSuggestions'

export const Persona = () => {
  const navigate = useNavigate()
  const params = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const removeQueryParam = useRemoveQueryParam()

  const setActivePersonaId = usePersonas_setActivePersonaId()
  const activePersona = usePersonas_activePersona()

  const { openDialog } = useDialog()

  useEffect(() => {
    const { personaid } = params
    setActivePersonaId(personaid)
  }, [params, location])

  const userId = useSpaces_currentUserId()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [provider, setProvider] = useState('openai')
  const [model, setModel] = useState('gpt4')
  const [systemMessage, setSystemMessage] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  
  useEffect(() => {
    setName(activePersona?.name)
    setDescription(activePersona?.description)
    setAvatar(activePersona?.avatar ? `http://localhost:8090/api/files/personas/${activePersona?.id}/${activePersona?.avatar}` : null)
    setProvider(activePersona?.provider || 'openai')
    setModel(activePersona?.model || 'gpt4')
    setSystemMessage(activePersona?.systemmessage || '')
  }, [activePersona])

  async function handleCreate() {
    if (!userId) return
    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('provider', provider)
    formData.append('model', model)
    formData.append('systemmessage', systemMessage)
    formData.append('userid', userId)
    if (file) {
      formData.append('avatar', file)
    }

    try {
      const response = await pb.collection('personas').create(formData)
      navigate(`/personas/${response.id}`)
    } 
    catch (error) {
      console.error('Failed to create persona:', error)
      alert('Error creating persona. Check console for details.')
    }
  }

  async function handleUpdate() {
    if (!userId && !activePersona?.id) return
    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('provider', provider)
    formData.append('model', model)
    formData.append('systemmessage', systemMessage)
    formData.append('userid', userId)
    if (file) {
      formData.append('avatar', file)
    }

    try {
      await pb.collection('personas').update(activePersona.id, formData)
      setEdit(false)
    } 
    catch (error) {
      console.error('Failed to create persona:', error)
      alert('Error updating persona. Check console for details.')
    }
  }

  async function handleDelete() {
    if (!userId && !activePersona?.id) return
    try {
      await pb.collection('personas').delete(activePersona.id)
    } 
    catch (error) {
      console.error('Failed to create persona:', error)
      alert('Error updating persona. Check console for details.')
    }
  }

  const [edit, setEdit] = useState(location.pathname === '/personas/create' || !!searchParams.get('edit'))

  const handleCancelEdit = useCallback(() => {
    setName(activePersona?.name)
    setDescription(activePersona?.description)
    setAvatar(activePersona?.avatar ? `http://localhost:8090/api/files/personas/${activePersona?.id}/${activePersona?.avatar}` : null)
    setProvider(activePersona?.provider || 'openai')
    setModel(activePersona?.model || 'gpt4')
    setSystemMessage(activePersona?.systemmessage || '')
    setEdit(false)
    removeQueryParam('edit')
  }, [activePersona])

  const dropdownItems = [
    {
      icon: 'edit',
      iconPrefix: 'fas',
      text: 'Edit',
      onClick: () => setEdit(true),
      compact: true
    },
    {
      children: <LineBreak color='var(--F_Font_Color_Disabled)'/>
    },
    {
      icon: 'trash-alt',
      iconPrefix: 'fas',
      text: 'Delete',
      onClick: () => {
        openDialog({
          mode: 'confirm',
          children: <ConfirmationMessage
            message='Are you sure you want to delete this persona?'
            name={name}
          />,
          callback: shouldDelete => { if (shouldDelete) handleDelete() }
        })
      },
      compact: true
    }
  ] as ItemProps[]

  return (
    <Box mt={1}>
      <Page>
        {
          edit
            ? <Gap gap={.75}>
                {
                  avatar && <Box width='100%'>
                    <Box width={8}>
                      <ImageDropTarget
                        onFileConverted={(file) => {
                          setFile(file)
                          setAvatar(URL.createObjectURL(file))
                        }}
                      >
                        <FileDrop 
                          onFileDrop={files => {
                            const file = files?.[0]
                            if (file) {
                              setFile(file)
                              setAvatar(URL.createObjectURL(file))
                            }
                          }}
                        >
                          <AspectRatio
                            ratio={1}
                            borderRadius={500}
                            backgroundSrc={avatar}
                          />
                        </FileDrop>
                      </ImageDropTarget>
                    </Box>
                  </Box>
                }
                <ImageSuggestions 
                  placeholder='Instructions'
                  prompt={`
                    This is for an avatar. It must look good when very small.
                    Name: ${name}
                    Description: ${description}
                  `}
                  onFileReady={(file) => {
                    setFile(file)
                    setAvatar(URL.createObjectURL(file))
                  }}
                  square
                >
                  <FileUpload
                    minimal
                    buttonProps={{
                      icon: 'upload',
                      iconPrefix: 'fas',
                      text: 'Upload avatar',
                      compact: true,
                      expand: true
                    }}
                    onFileChange={files => {
                      const file = files?.[0]
                      if (file) {
                        setFile(file)
                        setAvatar(URL.createObjectURL(file))
                      }
                    }}
                  />
                </ImageSuggestions>
                
                <Gap disableWrap>
                  <Gap disableWrap>
                    <TextInput
                      value={name}
                      onChange={val => setName(val)}
                      label='Name'
                      hero
                    />
                    {
                     (activePersona?.id && edit) &&
                      <Button
                        icon={'times'}
                        iconPrefix='fas'
                        hero
                        square
                        onClick={handleCancelEdit}
                      />
                    }
                    <Button
                      icon={activePersona?.id ? 'check' : 'user-plus'}
                      iconPrefix='fas'
                      hero
                      square
                      primary
                      disabled={name === ''}
                      onClick={activePersona?.id ? handleUpdate : handleCreate}
                    />
                  </Gap>
                </Gap>
              
                <TextInput
                  value={description}
                  onChange={val => setDescription(val)}
                  label='Description'
                  hero
                />
                <Gap disableWrap>
                  <Select
                    hero
                    label='Provider'
                    value={provider}
                    onChange={val => setProvider(val)}
                    options={[
                      {
                        label: 'OpenAI',
                        value: 'openai'
                      },
                      {
                        label: 'Groq',
                        value: 'groq'
                      },
                      {
                        label: 'Ollama',
                        value: 'ollama'
                      },
                      {
                        label: 'LlamaIndex',
                        value: 'llamaindex'
                      },
                      {
                        label: 'Agent',
                        value: 'agent'
                      },
                    ]}
                  />
                  <Select
                    hero
                    label='Model'
                    value={model}
                    onChange={val => setModel(val)}
                    options={[
                      {
                        label: 'GPT4',
                        value: 'gpt4'
                      },
                      {
                        label: 'Ollama 3 70B',
                        value: 'llama3-70b-8192'
                      },
                      {
                        label: 'Ollama 3',
                        value: 'ollama3'
                      },
                    ]}
                  />
                </Gap>
              
                <RichTextEditor
                  px={1}
                  value={systemMessage}
                  onChange={val => setSystemMessage(val)}
                  placeholder='System Message'
                  outline
                />
              </Gap>
            : <ContextMenu
                dropdownProps={{
                  items: dropdownItems
                }}
              >
                <Gap>
                  {
                    avatar && <Box width='100%'>
                      <Box width={8}>
                        <AspectRatio
                          ratio={1}
                          borderRadius={500}
                          backgroundSrc={avatar}
                        />
                      </Box>
                    </Box>
                  }
                  
                  <Item
                    pageTitle={activePersona?.name}
                    disablePadding
                    subtitle={`${activePersona?.description ? `${activePersona.description} ·` : ''} ${activePersona?.provider} · ${activePersona?.model}`}
                    absoluteRightChildren
                  >
                    <Box height='100%'>
                      <Dropdown
                        icon='ellipsis-h'
                        iconPrefix='fas'
                        minimal
                        compact
                        square
                        items={dropdownItems}
                      />
                    </Box>
                  </Item>
                  <Box mb={-1}>
                    <Item
                      subtitle='System message'
                      disablePadding
                      compact
                    />
                  </Box>
                  <StyleHTML>
                    <div dangerouslySetInnerHTML={{ __html: markdownToHTML(systemMessage || '') || '' }} />
                  </StyleHTML>
                </Gap>
              </ContextMenu>
        }
        
      </Page>
    </Box>
  )
}
