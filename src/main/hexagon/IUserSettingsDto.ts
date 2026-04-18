export type OpenAITtsModel = 'tts-1' | 'tts-1-hd'
export type OpenAITtsVoice = 'alloy' | 'nova' | 'echo' | 'fable' | 'onyx' | 'shimmer'

export type LocalSpeechEngineConfig = {
  type: 'local'
  status: 'installed' | 'not-installed'
}

export type OpenAISpeechEngineConfig = {
  type: 'openai'
  encryptedApiKey: string
  model: OpenAITtsModel
  voice: OpenAITtsVoice
}

export type SpeechEngineConfig = LocalSpeechEngineConfig | OpenAISpeechEngineConfig

/**
 * What the renderer sends when the user saves speech settings.
 * For OpenAI, the API key is plaintext (encrypted before persistence).
 * If `apiKey` is omitted when switching voice/model for an already-configured
 * OpenAI engine, the existing stored key is kept.
 */
export type SpeechEngineInput =
  | { type: 'local' }
  | {
      type: 'openai'
      apiKey?: string
      model: OpenAITtsModel
      voice: OpenAITtsVoice
    }

/**
 * What the renderer shows on Settings: everything except the decrypted key.
 */
export type SpeechEngineView =
  | { type: 'local'; status: 'installed' | 'not-installed' }
  | {
      type: 'openai'
      maskedApiKey: string
      model: OpenAITtsModel
      voice: OpenAITtsVoice
    }
  | null

/**
 * Used for both retrieval and create/update operations.
 */
export interface IUserSettingsDto {
  volume: number
  speech: SpeechEngineConfig | null
}
