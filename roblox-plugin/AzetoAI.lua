-- ============================================================
-- AzetoAI Plugin — Roblox Studio
-- Coller dans un LocalScript dans le plugin ScreenGui
-- ============================================================

local HttpService   = game:GetService("HttpService")
local RunService    = game:GetService("RunService")
local StudioService = game:GetService("StudioService")

-- ── Configuration ────────────────────────────────────────
local CONFIG = {
	API_URL    = "https://votre-site.com",  -- ← Remplacez par votre URL de déploiement
	API_KEY    = "",                         -- ← Sera chargée depuis le plugin settings
	VERSION    = "1.0.0",
}

-- ── Plugin UI Setup ──────────────────────────────────────
local toolbar  = plugin:CreateToolbar("AzetoAI")
local button   = toolbar:CreateButton(
	"AzetoAI Chat",
	"Ouvrir le chat AzetoAI",
	"rbxassetid://0"  -- Remplacer par l'asset ID de votre icône
)

local widget = plugin:CreateDockWidgetPluginGui(
	"AzetoAI",
	DockWidgetPluginGuiInfo.new(
		Enum.InitialDockState.Right,
		false, false,
		300, 500,
		200, 300
	)
)
widget.Title = "AzetoAI"

-- ── UI Components ────────────────────────────────────────
local screen = Instance.new("ScreenGui")
screen.ResetOnSpawn = false

local frame = Instance.new("Frame")
frame.Size            = UDim2.new(1, 0, 1, 0)
frame.BackgroundColor3 = Color3.fromHex("#0a0e1a")
frame.BorderSizePixel  = 0
frame.Parent           = widget

-- Header
local header = Instance.new("Frame")
header.Size              = UDim2.new(1, 0, 0, 50)
header.BackgroundColor3  = Color3.fromHex("#0f1424")
header.BorderSizePixel   = 0
header.Parent            = frame

local headerTitle = Instance.new("TextLabel")
headerTitle.Text            = "✦ AzetoAI"
headerTitle.Size            = UDim2.new(1, -16, 1, 0)
headerTitle.Position        = UDim2.new(0, 12, 0, 0)
headerTitle.BackgroundTransparency = 1
headerTitle.TextColor3      = Color3.fromHex("#4d78ff")
headerTitle.Font            = Enum.Font.GothamBold
headerTitle.TextSize        = 16
headerTitle.TextXAlignment  = Enum.TextXAlignment.Left
headerTitle.Parent          = header

-- Status dot
local statusDot = Instance.new("Frame")
statusDot.Size                = UDim2.new(0, 8, 0, 8)
statusDot.Position            = UDim2.new(1, -20, 0.5, -4)
statusDot.BackgroundColor3    = Color3.fromHex("#ef4444")
statusDot.BorderSizePixel     = 0
statusDot.Parent              = header
local dotCorner = Instance.new("UICorner")
dotCorner.CornerRadius = UDim.new(1, 0)
dotCorner.Parent = statusDot

-- API Key input area (shown when not verified)
local keyFrame = Instance.new("Frame")
keyFrame.Size            = UDim2.new(1, -16, 0, 80)
keyFrame.Position        = UDim2.new(0, 8, 0, 58)
keyFrame.BackgroundColor3 = Color3.fromHex("#131929")
keyFrame.BorderSizePixel = 0
keyFrame.Parent          = frame

local keyCorner = Instance.new("UICorner")
keyCorner.CornerRadius = UDim.new(0, 8)
keyCorner.Parent = keyFrame

local keyLabel = Instance.new("TextLabel")
keyLabel.Text              = "Clé API :"
keyLabel.Size              = UDim2.new(1, -12, 0, 20)
keyLabel.Position          = UDim2.new(0, 8, 0, 6)
keyLabel.BackgroundTransparency = 1
keyLabel.TextColor3        = Color3.fromHex("#7a90b8")
keyLabel.Font              = Enum.Font.Gotham
keyLabel.TextSize          = 12
keyLabel.TextXAlignment    = Enum.TextXAlignment.Left
keyLabel.Parent            = keyFrame

local keyInput = Instance.new("TextBox")
keyInput.Size              = UDim2.new(1, -80, 0, 28)
keyInput.Position          = UDim2.new(0, 8, 0, 28)
keyInput.BackgroundColor3  = Color3.fromHex("#0f1424")
keyInput.TextColor3        = Color3.fromHex("#e8eeff")
keyInput.PlaceholderText   = "azeto_xxxxxxxxxxxxx"
keyInput.PlaceholderColor3 = Color3.fromHex("#4a6080")
keyInput.Font              = Enum.Font.Code
keyInput.TextSize          = 11
keyInput.ClearTextOnFocus  = false
keyInput.Text              = CONFIG.API_KEY
keyInput.BorderSizePixel   = 0
keyInput.Parent            = keyFrame

local keyInputCorner = Instance.new("UICorner")
keyInputCorner.CornerRadius = UDim.new(0, 6)
keyInputCorner.Parent = keyInput

local verifyBtn = Instance.new("TextButton")
verifyBtn.Size             = UDim2.new(0, 60, 0, 28)
verifyBtn.Position         = UDim2.new(1, -68, 0, 28)
verifyBtn.BackgroundColor3 = Color3.fromHex("#2250e8")
verifyBtn.TextColor3       = Color3.fromHex("#ffffff")
verifyBtn.Font             = Enum.Font.GothamBold
verifyBtn.TextSize         = 12
verifyBtn.Text             = "Vérifier"
verifyBtn.BorderSizePixel  = 0
verifyBtn.Parent           = keyFrame

local verifyCorner = Instance.new("UICorner")
verifyCorner.CornerRadius = UDim.new(0, 6)
verifyCorner.Parent = verifyBtn

-- Chat scroll area
local chatScroll = Instance.new("ScrollingFrame")
chatScroll.Size              = UDim2.new(1, -16, 1, -200)
chatScroll.Position          = UDim2.new(0, 8, 0, 148)
chatScroll.BackgroundColor3  = Color3.fromHex("#0f1424")
chatScroll.BorderSizePixel   = 0
chatScroll.ScrollBarThickness = 3
chatScroll.ScrollBarImageColor3 = Color3.fromHex("#253555")
chatScroll.CanvasSize        = UDim2.new(0, 0, 0, 0)
chatScroll.AutomaticCanvasSize = Enum.AutomaticSize.Y
chatScroll.Parent            = frame

local chatCorner = Instance.new("UICorner")
chatCorner.CornerRadius = UDim.new(0, 8)
chatCorner.Parent = chatScroll

local chatLayout = Instance.new("UIListLayout")
chatLayout.Padding       = UDim.new(0, 8)
chatLayout.SortOrder     = Enum.SortOrder.LayoutOrder
chatLayout.Parent        = chatScroll

local chatPadding = Instance.new("UIPadding")
chatPadding.PaddingTop    = UDim.new(0, 8)
chatPadding.PaddingLeft   = UDim.new(0, 8)
chatPadding.PaddingRight  = UDim.new(0, 8)
chatPadding.PaddingBottom = UDim.new(0, 8)
chatPadding.Parent        = chatScroll

-- Input area
local inputFrame = Instance.new("Frame")
inputFrame.Size             = UDim2.new(1, -16, 0, 44)
inputFrame.Position         = UDim2.new(0, 8, 1, -52)
inputFrame.BackgroundColor3 = Color3.fromHex("#131929")
inputFrame.BorderSizePixel  = 0
inputFrame.Parent           = frame

local inputCorner = Instance.new("UICorner")
inputCorner.CornerRadius = UDim.new(0, 10)
inputCorner.Parent = inputFrame

local msgInput = Instance.new("TextBox")
msgInput.Size              = UDim2.new(1, -52, 1, 0)
msgInput.Position          = UDim2.new(0, 12, 0, 0)
msgInput.BackgroundTransparency = 1
msgInput.TextColor3        = Color3.fromHex("#e8eeff")
msgInput.PlaceholderText   = "Posez une question à AzetoAI…"
msgInput.PlaceholderColor3 = Color3.fromHex("#4a6080")
msgInput.Font              = Enum.Font.Gotham
msgInput.TextSize          = 13
msgInput.ClearTextOnFocus  = false
msgInput.MultiLine         = false
msgInput.TextXAlignment    = Enum.TextXAlignment.Left
msgInput.Parent            = inputFrame

local sendBtn = Instance.new("TextButton")
sendBtn.Size             = UDim2.new(0, 36, 0, 36)
sendBtn.Position         = UDim2.new(1, -40, 0.5, -18)
sendBtn.BackgroundColor3 = Color3.fromHex("#2250e8")
sendBtn.TextColor3       = Color3.fromHex("#ffffff")
sendBtn.Font             = Enum.Font.GothamBold
sendBtn.TextSize         = 16
sendBtn.Text             = "→"
sendBtn.BorderSizePixel  = 0
sendBtn.Parent           = inputFrame

local sendCorner = Instance.new("UICorner")
sendCorner.CornerRadius = UDim.new(0, 8)
sendCorner.Parent = sendBtn

-- ── State ────────────────────────────────────────────────
local isVerified = false
local msgOrder   = 0

-- ── Helper: Create message bubble ────────────────────────
local function createBubble(text: string, isUser: boolean, isLoading: boolean?)
	msgOrder += 1

	local bubble = Instance.new("Frame")
	bubble.Size                = UDim2.new(1, 0, 0, 0)
	bubble.AutomaticSize       = Enum.AutomaticSize.Y
	bubble.BackgroundTransparency = 1
	bubble.LayoutOrder         = msgOrder
	bubble.Name                = isUser and "UserMsg" or "AiMsg"

	local bg = Instance.new("Frame")
	bg.Size                = isUser and UDim2.new(0.8, 0, 0, 0) or UDim2.new(0.95, 0, 0, 0)
	bg.Position            = isUser and UDim2.new(0.2, 0, 0, 0) or UDim2.new(0, 0, 0, 0)
	bg.AutomaticSize       = Enum.AutomaticSize.Y
	bg.BackgroundColor3    = isUser and Color3.fromHex("#7c3aed") or Color3.fromHex("#131929")
	bg.BorderSizePixel     = 0
	bg.Parent              = bubble

	local bgCorner = Instance.new("UICorner")
	bgCorner.CornerRadius = UDim.new(0, 10)
	bgCorner.Parent = bg

	local bgPad = Instance.new("UIPadding")
	bgPad.PaddingTop    = UDim.new(0, 8)
	bgPad.PaddingLeft   = UDim.new(0, 10)
	bgPad.PaddingRight  = UDim.new(0, 10)
	bgPad.PaddingBottom = UDim.new(0, 8)
	bgPad.Parent = bg

	local label = Instance.new("TextLabel")
	label.Name              = "Content"
	label.Size              = UDim2.new(1, 0, 0, 0)
	label.AutomaticSize     = Enum.AutomaticSize.Y
	label.BackgroundTransparency = 1
	label.TextColor3        = Color3.fromHex(isUser and "#e8eeff" or "#c8d8f0")
	label.Font              = Enum.Font.Gotham
	label.TextSize          = 13
	label.TextWrapped       = true
	label.RichText          = false
	label.TextXAlignment    = Enum.TextXAlignment.Left
	label.Text              = isLoading and "AzetoAI réfléchit…" or text
	label.Parent            = bg

	bubble.Parent = chatScroll

	-- Scroll to bottom
	task.wait(0.05)
	chatScroll.CanvasPosition = Vector2.new(0, math.huge)

	return bubble
end

-- ── Helper: Show error ────────────────────────────────────
local function showError(msg: string)
	local errBubble = Instance.new("Frame")
	errBubble.Size                = UDim2.new(1, 0, 0, 32)
	errBubble.BackgroundColor3    = Color3.fromHex("#2a0a0a")
	errBubble.BorderSizePixel     = 0
	errBubble.LayoutOrder         = msgOrder + 1
	errBubble.Parent              = chatScroll

	local errCorner = Instance.new("UICorner")
	errCorner.CornerRadius = UDim.new(0, 8)
	errCorner.Parent = errBubble

	local errLabel = Instance.new("TextLabel")
	errLabel.Size              = UDim2.new(1, -16, 1, 0)
	errLabel.Position          = UDim2.new(0, 8, 0, 0)
	errLabel.BackgroundTransparency = 1
	errLabel.TextColor3        = Color3.fromHex("#ef4444")
	errLabel.Font              = Enum.Font.Gotham
	errLabel.TextSize          = 12
	errLabel.Text              = "⚠ " .. msg
	errLabel.TextXAlignment    = Enum.TextXAlignment.Left
	errLabel.Parent            = errBubble

	task.delay(4, function() errBubble:Destroy() end)
end

-- ── Verify API Key ───────────────────────────────────────
local function verifyKey(apiKey: string): boolean
	if apiKey == "" then return false end

	local ok, result = pcall(function()
		return HttpService:RequestAsync({
			Url     = CONFIG.API_URL .. "/api/plugin/verify",
			Method  = "POST",
			Headers = {
				["Content-Type"]  = "application/json",
				["Authorization"] = "Bearer " .. apiKey,
			},
			Body    = HttpService:JSONEncode({ api_key = apiKey }),
		})
	end)

	if not ok then return false end

	local data = HttpService:JSONDecode(result.Body)
	return data.valid == true
end

-- ── Send message to AI ───────────────────────────────────
local function sendMessage(text: string)
	if not isVerified then
		showError("Vérifiez votre clé API d'abord.")
		return
	end
	if text == "" then return end

	-- User bubble
	createBubble(text, true)

	-- Loading bubble
	local loadBubble = createBubble("", false, true)

	-- Get selected script context
	local context = ""
	-- (optionnel : récupérer le script sélectionné dans Studio)

	local ok, result = pcall(function()
		return HttpService:RequestAsync({
			Url     = CONFIG.API_URL .. "/api/plugin/chat",
			Method  = "POST",
			Headers = {
				["Content-Type"]  = "application/json",
				["Authorization"] = "Bearer " .. CONFIG.API_KEY,
			},
			Body    = HttpService:JSONEncode({
				message = text,
				api_key = CONFIG.API_KEY,
				context = context,
			}),
		})
	end)

	loadBubble:Destroy()

	if not ok then
		showError("Erreur réseau. Vérifiez votre connexion.")
		return
	end

	if result.StatusCode == 401 then
		showError("Clé API invalide (401).")
		isVerified = false
		statusDot.BackgroundColor3 = Color3.fromHex("#ef4444")
		return
	elseif result.StatusCode == 403 then
		showError("Accès refusé (403).")
		return
	elseif result.StatusCode >= 500 then
		showError("Erreur serveur (" .. result.StatusCode .. "). Réessayez.")
		return
	end

	local data = HttpService:JSONDecode(result.Body)
	createBubble(data.reply or "Pas de réponse.", false)
end

-- ── Events ───────────────────────────────────────────────
verifyBtn.MouseButton1Click:Connect(function()
	local key = keyInput.Text:gsub("%s+", "")
	verifyBtn.Text = "…"

	if verifyKey(key) then
		CONFIG.API_KEY = key
		isVerified     = true
		statusDot.BackgroundColor3 = Color3.fromHex("#10b981")
		verifyBtn.Text             = "✓ OK"
		keyFrame.BackgroundColor3  = Color3.fromHex("#0a1a14")
		createBubble("Connecté ! Posez-moi une question sur Roblox Studio.", false)
	else
		isVerified     = false
		verifyBtn.Text = "✗ Erreur"
		showError("Clé API invalide.")
		task.delay(2, function() verifyBtn.Text = "Vérifier" end)
	end
end)

sendBtn.MouseButton1Click:Connect(function()
	local text = msgInput.Text:gsub("^%s+", ""):gsub("%s+$", "")
	if text == "" then return end
	msgInput.Text = ""
	sendMessage(text)
end)

msgInput.FocusLost:Connect(function(enterPressed)
	if enterPressed then
		local text = msgInput.Text:gsub("^%s+", ""):gsub("%s+$", "")
		if text == "" then return end
		msgInput.Text = ""
		sendMessage(text)
	end
end)

button.Click:Connect(function()
	widget.Enabled = not widget.Enabled
end)

-- Welcome message
createBubble("👋 Bonjour ! Je suis AzetoAI. Entrez votre clé API pour commencer.", false)
