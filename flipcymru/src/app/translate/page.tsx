// src/app/translate/page.tsx
// (Only relevant sections shown for brevity - ensure you merge these changes)

// ... existing imports ...

const TranslatePage: React.FC = () => {
  // ... existing states and functions ...

  return (
    <Layout>
      {/* ... existing TranslatePage content ... */}

      {/* Translation Input/Output Area */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        {/* ... language swap button ... */}

        {/* Source Text Input */}
        <TextField
          label={isEnglishToWelsh ? 'Enter English Text' : 'Enter Welsh Text'}
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          disabled={isTranslating || isRecording || isTranscribingVoice}
          sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'gray-300' },
                  '&:hover fieldset': { borderColor: 'blue-500' },
                  '&.Mui-focused fieldset': { borderColor: 'blue-500' },
                  '& textarea': { color: 'gray-900' }, // Light mode text color
              },
              '& .MuiInputLabel-root': { color: 'gray-600' }, // Light mode label color
              '.dark & .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'gray-600' },
                  '&:hover fieldset': { borderColor: 'blue-400' },
                  '&.Mui-focused fieldset': { borderColor: 'blue-400' },
                  '& textarea': { color: 'white' }, // <--- Dark mode text color: WHITE
              },
              '.dark & .MuiInputLabel-root': { color: 'gray-400' }, // <--- Dark mode label color: LIGHTER GRAY
              '.Mui-disabled': { opacity: 0.7 } // General disabled opacity
          }}
        />

        {/* ... error alerts and translate button ... */}

        {/* Translated Text Output */}
        {translatedText && (
          <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 relative">
            <p className="text-gray-800 dark:text-white text-lg break-words">{translatedText}</p>
            {/* ... copy/listen/save buttons ... */}
          </div>
        )}
      </div>

      {/* ... Voice Translation and Camera Translation sections ... */}

      {/* Translation History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        {/* ... history list ... */}
      </div>

      {/* Save as Flashcard Modal */}
      <Dialog open={showSaveAsFlashcardModal} onClose={() => setShowSaveAsFlashcardModal(false)} fullWidth maxWidth="sm">
        <DialogTitle className="!bg-blue-600 !text-white">Save as Flashcard</DialogTitle>
        <DialogContent className="!py-6 !px-4 dark:!bg-gray-800">
            {flashcardSaveError && (
                <Alert severity="error" className="mb-3">
                    {flashcardSaveError}
                </Alert>
            )}
            {/* English Text Field */}
            <TextField
                margin="dense"
                label="English Text"
                type="text"
                fullWidth
                variant="outlined"
                value={flashcardEnglishText}
                InputProps={{
                    readOnly: true,
                }}
                sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'gray-300' },
                        '& input': { color: 'gray-900', },
                    },
                    '& .MuiInputLabel-root': { color: 'gray-600' },
                    '.dark & .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'gray-600' },
                        '& input': { color: 'white' }, // <--- Dark mode text color: WHITE
                    },
                    '.dark & .MuiInputLabel-root': { color: 'gray-400' }, // <--- Dark mode label color: LIGHTER GRAY
                }}
            />
            {/* Welsh Translation Text Field */}
            <TextField
                margin="dense"
                label="Welsh Translation"
                type="text"
                fullWidth
                variant="outlined"
                value={flashcardWelshText}
                InputProps={{
                    readOnly: true,
                }}
                sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'gray-300' },
                        '& input': { color: 'gray-900', },
                    },
                    '& .MuiInputLabel-root': { color: 'gray-600' },
                    '.dark & .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'gray-600' },
                        '& input': { color: 'white' }, // <--- Dark mode text color: WHITE
                    },
                    '.dark & .MuiInputLabel-root': { color: 'gray-400' }, // <--- Dark mode label color: LIGHTER GRAY
                }}
            />
            {/* Category Select */}
            <FormControl fullWidth margin="dense" variant="outlined" sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'gray-300' },
                    '&:hover fieldset': { borderColor: 'blue-500' },
                    '&.Mui-focused fieldset': { borderColor: 'blue-500' },
                    '& .MuiSelect-select': { color: 'gray-900' }, // Light mode select text color
                },
                '& .MuiInputLabel-root': { color: 'gray-600' }, // Light mode label color
                '.dark & .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'gray-600' },
                    '&:hover fieldset': { borderColor: 'blue-400' },
                    '&.Mui-focused fieldset': { borderColor: 'blue-400' },
                    '& .MuiSelect-select': { color: 'white' }, // <--- Dark mode select text color: WHITE
                    '& .MuiSvgIcon-root': { color: 'white' } // <--- Dark mode select arrow color: WHITE
                },
                '.dark & .MuiInputLabel-root': { color: 'gray-400' }, // <--- Dark mode label color: LIGHTER GRAY
            }}>
                <InputLabel id="flashcard-category-select-label">Category</InputLabel>
                <Select
                    labelId="flashcard-category-select-label"
                    value={flashcardCategory}
                    onChange={(e) => { setFlashcardCategory(e.target.value as string); setNewFlashcardCategoryName(''); }}
                    label="Category"
                    disabled={isSavingFlashcard}
                >
                    <MenuItem value="">
                        <em>Select Existing or New Category Below</em>
                    </MenuItem>
                    {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.name}>
                            {cat.name}
                        </MenuItem>
                    ))}
                    <MenuItem value="Saved Translations">
                         <span className="font-semibold text-blue-600 dark:text-blue-400">Saved Translations</span>
                    </MenuItem>
                </Select>
            </FormControl>

            {/* New Category Name Text Field */}
            <TextField
                margin="dense"
                label="Or create New Category Name"
                type="text"
                fullWidth
                variant="outlined"
                value={newFlashcardCategoryName}
                onChange={(e) => { setNewFlashcardCategoryName(e.target.value); setFlashcardCategory(''); }}
                disabled={isSavingFlashcard}
                sx={{
                    mt: 2,
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'gray-300' },
                        '&:hover fieldset': { borderColor: 'blue-500' },
                        '&.Mui-focused fieldset': { borderColor: 'blue-500' },
                        '& input': { color: 'gray-900' }, // Light mode text color
                    },
                    '& .MuiInputLabel-root': { color: 'gray-600' }, // Light mode label color
                    '& .Mui-disabled': {
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'gray-400 !important' },
                        '& .MuiInputBase-input': { color: 'gray-500 !important' },
                        '& .MuiInputLabel-root': { color: 'gray-500 !important' }
                    },
                    '.dark & .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'gray-600' },
                        '&:hover fieldset': { borderColor: 'blue-400' },
                        '&.Mui-focused fieldset': { borderColor: 'blue-400' },
                        '& input': { color: 'white' }, // <--- Dark mode text color: WHITE
                    },
                    '.dark & .MuiInputLabel-root': { color: 'gray-400' }, // <--- Dark mode label color: LIGHTER GRAY
                    '.dark & .Mui-disabled': { // Disabled state for dark mode
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'gray-500 !important' },
                        '& .MuiInputBase-input': { color: 'gray-400 !important' },
                        '& .MuiInputLabel-root': { color: 'gray-500 !important' }
                    },
                }}
            />
        </DialogContent>
        {/* ... rest of the modal actions ... */}
      </Dialog>
    </Layout>
  );
};

export default TranslatePage;