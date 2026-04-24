import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Linking,
    Share,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const restaurant = {
    name: 'Pizzeria Castello',
    reviewCount: 4727,
    priceRange: '1–10 €',
    category: 'Restaurant',
    status: 'Dauerhaft geschlossen',
    address: 'Bahnhofstraße 42, 46145 Oberhausen',
    phone: '0208 38590901',
    pricePerPerson: '1–10 €',
    reportedBy: 13,
};

export default function RestaurantDetailScreen() {
    const navigation = useNavigation<any>();

    const handleCall = () => {
        Linking.openURL(`tel:${restaurant.phone.replace(/\s/g, '')}`);
    };

    const handleDirections = () => {
        const query = encodeURIComponent(restaurant.address);
        const url = Platform.select({
            ios: `maps:0,0?q=${query}`,
            android: `geo:0,0?q=${query}`,
            default: `https://www.google.com/maps/search/?api=1&query=${query}`,
        });
        Linking.openURL(url!);
    };

    const handleShare = async () => {
        await Share.share({
            title: restaurant.name,
            message: `${restaurant.name}\n${restaurant.address}\nTel: ${restaurant.phone}`,
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Restaurant</Text>
                <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                    <Ionicons name="share-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollArea}>
                <View style={styles.hero}>
                    <View style={styles.heroIcon}>
                        <Ionicons name="pizza" size={56} color="#FA4A0C" />
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>{restaurant.name}</Text>

                    <View style={styles.metaRow}>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={14} color="#FFB400" />
                            <Text style={styles.ratingText}>
                                {restaurant.reviewCount.toLocaleString('de-DE')} Rezensionen
                            </Text>
                        </View>
                        <Text style={styles.metaDot}>·</Text>
                        <Text style={styles.metaText}>{restaurant.priceRange}</Text>
                        <Text style={styles.metaDot}>·</Text>
                        <Text style={styles.metaText}>{restaurant.category}</Text>
                    </View>

                    <View style={styles.statusBadge}>
                        <Ionicons name="close-circle" size={16} color="#D32F2F" />
                        <Text style={styles.statusText}>{restaurant.status}</Text>
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
                            <Ionicons name="navigate" size={22} color="#FA4A0C" />
                            <Text style={styles.actionLabel}>Route</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} disabled>
                            <Ionicons name="bookmark-outline" size={22} color="#999" />
                            <Text style={[styles.actionLabel, styles.actionLabelDisabled]}>Speichern</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                            <Ionicons name="share-social-outline" size={22} color="#FA4A0C" />
                            <Text style={styles.actionLabel}>Teilen</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                            <Ionicons name="call" size={22} color="#FA4A0C" />
                            <Text style={styles.actionLabel}>Anrufen</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={20} color="#FA4A0C" style={styles.infoIcon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Adresse</Text>
                                <Text style={styles.infoValue}>{restaurant.address}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Ionicons name="call-outline" size={20} color="#FA4A0C" style={styles.infoIcon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Telefon</Text>
                                <TouchableOpacity onPress={handleCall}>
                                    <Text style={[styles.infoValue, styles.infoLink]}>{restaurant.phone}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Ionicons name="cash-outline" size={20} color="#FA4A0C" style={styles.infoIcon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Preis pro Person</Text>
                                <Text style={styles.infoValue}>{restaurant.pricePerPerson}</Text>
                                <Text style={styles.infoHint}>Von {restaurant.reportedBy} Personen gemeldet</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.suggestButton}>
                        <Ionicons name="create-outline" size={18} color="#666" />
                        <Text style={styles.suggestText}>Änderung vorschlagen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.suggestButton}>
                        <Ionicons name="business-outline" size={18} color="#666" />
                        <Text style={styles.suggestText}>Inhaber dieses Unternehmens?</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    iconButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
    scrollArea: { flex: 1 },
    hero: {
        height: 180,
        backgroundColor: '#FFF5F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroIcon: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    content: { padding: 24 },
    title: { fontSize: 32, fontWeight: '800', color: '#111', marginBottom: 12 },
    metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 14, color: '#333', fontWeight: '500' },
    metaDot: { fontSize: 14, color: '#999', marginHorizontal: 6 },
    metaText: { fontSize: 14, color: '#666' },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#FFEBEE',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
        marginBottom: 24,
    },
    statusText: { color: '#D32F2F', fontSize: 13, fontWeight: '600' },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 24,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F0F0F0',
    },
    actionButton: { alignItems: 'center', gap: 6, flex: 1 },
    actionLabel: { fontSize: 12, color: '#FA4A0C', fontWeight: '600' },
    actionLabelDisabled: { color: '#999' },
    infoCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8 },
    infoIcon: { marginRight: 14, marginTop: 2 },
    infoTextContainer: { flex: 1 },
    infoLabel: { fontSize: 12, color: '#888', textTransform: 'uppercase', marginBottom: 4 },
    infoValue: { fontSize: 16, color: '#222', fontWeight: '500' },
    infoLink: { color: '#FA4A0C', textDecorationLine: 'underline' },
    infoHint: { fontSize: 12, color: '#999', marginTop: 4 },
    divider: { height: 1, backgroundColor: '#ECECEC', marginVertical: 4 },
    suggestButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEE',
        marginBottom: 10,
    },
    suggestText: { fontSize: 14, color: '#555', fontWeight: '500' },
});
