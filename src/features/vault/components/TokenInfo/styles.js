const styles = (theme) => ({
    cardContainer: {
        backgroundColor: 'transparent',
        marginTop: '20px'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#272B4A',
        borderRadius: '20px 20px 0 0',
        padding: '20px'
    },
    cardActions: {
        margin: '10px'
    },
    cardContent: {
        backgroundColor: '#313759',
        borderRadius: '0 0 20px 20px',
        padding: '20px'
    },
    cardTitle: {
        fontFamily: 'Proxima Nova',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: '30px',
        lineHeight: '42px'
    },
    cardSubtitle: {
        fontFamily: 'Proxima Nova',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: '18px',
        lineHeight: '24px',
        color: '#8585A6',
        letterSpacing: '0.2px'
    }
});

export default styles;
