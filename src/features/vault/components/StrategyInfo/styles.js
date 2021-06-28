const bold = {
    fontFamily: 'Proxima Nova',
    fontStyle: 'normal',
    fontWeight: 600,
}

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
        display: 'flex',
        flexDirection: 'column',
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
    apyContainer: {},
    apys: {
        display: 'flex',
    },
    apyTitle: {
        ...bold,
        fontSize: "18px",
        lineHeight: "30px"
    },
    apy: {},
    apyValue: {
        ...bold,
        fontSize: "18px",
        lineHeight: "30px"
    },
    apyLabel: {
        fontFamily: 'Proxima Nova',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: '15px',
        lineHeight: '24px',
        letterSpacing: '0.2px',
        color: '#8585A6'
    },
    audits: {
        display: 'flex'
    },
    audit: {
        display: 'flex'
    }
});

export default styles;
