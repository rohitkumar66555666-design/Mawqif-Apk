import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { testSupabaseConnection, addBookmark, removeBookmark, getBookmarksForUser } from '../services/bookmarks.service';
import { useTheme } from '../contexts/ThemeContext';

export const BookmarkDebugger: React.FC = () => {
    const { theme } = useTheme();
    const [testResults, setTestResults] = useState<string[]>([]);
    const testUserId = 'test-user-123';
    const testPlaceId = 'test-place-456';

    const addTestResult = (result: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
    };

    const runTests = async () => {
        setTestResults([]);
        addTestResult('🧪 Starting bookmark tests...');

        try {
            // Test 1: Connection
            addTestResult('1️⃣ Testing Supabase connection...');
            const connectionOk = await testSupabaseConnection();
            addTestResult(connectionOk ? '✅ Connection successful' : '❌ Connection failed');

            // Test 2: Add bookmark
            addTestResult('2️⃣ Testing add bookmark...');
            await addBookmark(testUserId, testPlaceId);
            addTestResult('✅ Bookmark added');

            // Test 3: Get bookmarks
            addTestResult('3️⃣ Testing get bookmarks...');
            const bookmarks = await getBookmarksForUser(testUserId);
            addTestResult(`✅ Found ${bookmarks.length} bookmarks: ${bookmarks.join(', ')}`);

            // Test 4: Remove bookmark
            addTestResult('4️⃣ Testing remove bookmark...');
            await removeBookmark(testUserId, testPlaceId);
            addTestResult('✅ Bookmark removed');

            // Test 5: Verify removal
            addTestResult('5️⃣ Verifying removal...');
            const bookmarksAfter = await getBookmarksForUser(testUserId);
            addTestResult(`✅ Found ${bookmarksAfter.length} bookmarks after removal`);

            addTestResult('🎉 All tests completed successfully!');
        } catch (error) {
            addTestResult(`❌ Test failed: ${error}`);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
            <Text style={[styles.title, { color: theme.text }]}>Bookmark Debugger</Text>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={runTests}
            >
                <Text style={[styles.buttonText, { color: theme.surface }]}>Run Bookmark Tests</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.textSecondary }]}
                onPress={() => setTestResults([])}
            >
                <Text style={[styles.buttonText, { color: theme.surface }]}>Clear Results</Text>
            </TouchableOpacity>

            <View style={styles.results}>
                {testResults.map((result, index) => (
                    <Text key={index} style={[styles.resultText, { color: theme.textSecondary }]}>
                        {result}
                    </Text>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 16,
        padding: 16,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    button: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 8,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    results: {
        marginTop: 16,
        maxHeight: 200,
    },
    resultText: {
        fontSize: 12,
        marginBottom: 4,
        fontFamily: 'monospace',
    },
});

export default BookmarkDebugger;
