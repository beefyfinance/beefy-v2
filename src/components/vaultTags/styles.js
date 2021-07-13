const styles = theme => ({
    tags: {
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.5px',
        padding: '3px 9px',
        borderRadius: '5px',
        margin: '0 3px',
        textTransform: "uppercase",
        wordBreak: 'break-word'
    },
    lowTag: {
        backgroundColor: '#2E90A5',
    },
    recentTag: {
        backgroundColor: '#9D57F7',
    },
    boostTag: {
        backgroundColor: '#E88225',
    },
    stableTag: {
        backgroundColor: '#57A1F7',
    },
    topTag: {
        backgroundColor: '#073FAB',
    },
    depositsPausedTag: {
        backgroundColor: '#000000',
        letterSpacing: '0.15px',
        padding: '3px 5px',
    },
    eolTag: {
        backgroundColor: '#000000'
    },
    pausedTag: {
        backgroundColor: '#484F7F'
    }
});

export default styles;
