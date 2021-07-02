const styles = (theme) => ({
    cardContainer: {
        backgroundColor: 'transparent',
        margin: '20px auto'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#272B4A',
        borderRadius: '20px 20px 0 0',
        padding: '30px 32px 36px 32px'
    },
    cardActions: {
        display: 'flex',
    },
    cardAction: {
        marginLeft: '15px'
    },
    cardContent: {
        backgroundColor: '#313759',
        borderRadius: '0 0 20px 20px',
        padding: '30px 32px 36px 32px'
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
    },
    text: {
        fontFamily: "Proxima Nova",
        fontStyle: "normal",
        fontWeight: "normal",
        fontSize: "18px",
        lineHeight: "32px",
    }
});

export default styles;
